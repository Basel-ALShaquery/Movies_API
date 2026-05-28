import { describe, it, expect, vi, beforeEach } from "vitest";
import supertest from "supertest";

vi.mock("pino-http", () => ({
  default: () => (req, res, next) => next(),
}));

vi.mock("helmet", () => ({
  default: () => (req, res, next) => next(),
}));

vi.mock("cors", () => ({
  default: () => (req, res, next) => next(),
}));

vi.mock("express-rate-limit", () => ({
  default: () => (req, res, next) => next(),
}));

vi.mock("../config/logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    fatal: vi.fn(),
    debug: vi.fn(),
    flush: vi.fn(),
  },
  logError: vi.fn(),
}));

const mockDb = vi.hoisted(() => {
  const q = {
    _result: null,
    select: vi.fn(() => q),
    insert: vi.fn(() => q),
    update: vi.fn(() => q),
    delete: vi.fn(() => q),
    eq: vi.fn(() => q),
    order: vi.fn(() => q),
    range: vi.fn(() => q),
    ilike: vi.fn(() => q),
    limit: vi.fn(() => q),
    maybeSingle: vi.fn(() => q),
    single: vi.fn(() => q),
    then(onFulfilled) {
      return Promise.resolve(q._result).then(onFulfilled);
    },
  };
  return { q };
});

vi.mock("../config/supabase.js", () => ({
  supabase: {
    from: vi.fn(() => mockDb.q),
  },
}));

import app from "../app.js";

const request = supertest(app);
const validAuth = "Bearer test-api-key";

const movieRow = {
  id: "d1a0e7b0-6f3a-4a1e-8b0a-3e7b0a6f3a4a",
  title: "Interstellar",
  year: 2014,
  genre: "Sci-Fi",
  created_at: "2026-01-01T00:00:00.000000",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockDb.q._result = null;
});

describe("GET /api/movies", () => {
  it("returns 200 with paginated movie list", async () => {
    mockDb.q._result = { data: [movieRow], error: null, count: 1 };

    const res = await request.get("/api/movies");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Interstellar");
    expect(res.body.meta).toEqual({
      page: 1,
      limit: 100,
      total: 1,
      totalPages: 1,
    });
  });
});

describe("POST /api/movies", () => {
  it("returns 201 with created movie when authenticated", async () => {
    mockDb.q._result = { data: movieRow, error: null };

    const res = await request
      .post("/api/movies")
      .set("Authorization", validAuth)
      .send({ title: "Interstellar", year: 2014, genre: "Sci-Fi" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Interstellar");
  });

  it("returns 401 without auth header", async () => {
    const res = await request
      .post("/api/movies")
      .send({ title: "Interstellar", year: 2014, genre: "Sci-Fi" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 with invalid auth format", async () => {
    const res = await request
      .post("/api/movies")
      .set("Authorization", "Invalid token")
      .send({ title: "Interstellar", year: 2014, genre: "Sci-Fi" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 with wrong API key", async () => {
    const res = await request
      .post("/api/movies")
      .set("Authorization", "Bearer wrong-key")
      .send({ title: "Interstellar", year: 2014, genre: "Sci-Fi" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("includes WWW-Authenticate header on auth failure", async () => {
    const res = await request
      .post("/api/movies")
      .set("Authorization", "Bearer wrong-key")
      .send({ title: "Interstellar", year: 2014, genre: "Sci-Fi" });

    expect(res.headers["www-authenticate"]).toBe('Bearer realm="api"');
  });
});

describe("validation errors", () => {
  it("returns 400 when title is missing", async () => {
    const res = await request
      .post("/api/movies")
      .set("Authorization", validAuth)
      .send({ year: 2014, genre: "Sci-Fi" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toBeDefined();
    expect(
      res.body.error.details.some((d) => d.path === "title")
    ).toBe(true);
  });

  it("returns 400 when body is empty JSON", async () => {
    const res = await request
      .post("/api/movies")
      .set("Authorization", validAuth)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for invalid year range", async () => {
    const res = await request
      .post("/api/movies")
      .set("Authorization", validAuth)
      .send({ title: "Bad", year: 1700, genre: "Drama" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/movies/:id — missing movie", () => {
  it("returns 404 when movie does not exist", async () => {
    mockDb.q._result = { data: null, error: null };

    const res = await request.get(
      "/api/movies/00000000-0000-0000-0000-000000000000"
    );

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("MOVIE_NOT_FOUND");
  });
});

describe("DELETE /api/movies/:id", () => {
  it("returns 200 when authenticated", async () => {
    mockDb.q._result = { data: movieRow, error: null };

    const res = await request
      .delete("/api/movies/d1a0e7b0-6f3a-4a1e-8b0a-3e7b0a6f3a4a")
      .set("Authorization", validAuth);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Movie deleted successfully");
  });

  it("returns 401 without auth header", async () => {
    const res = await request.delete(
      "/api/movies/d1a0e7b0-6f3a-4a1e-8b0a-3e7b0a6f3a4a"
    );

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import { logger } from "./config/logger.js";
import { config } from "./config/env.js";
import { supabase } from "./config/supabase.js";
import { requestId } from "./middleware/requestId.js";
import moviesRouter from "./modules/movies/movie.routes.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// 1. Request ID — sets X-Request-Id on every response
app.use(requestId);

// 2. HTTP Security Headers
app.use(helmet());

// 3. Structured request logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === "/health",
    },
  })
);

// 4. Rate limiting for API protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later.",
    },
  },
});
app.use("/api", limiter);

// 5. CORS config
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
      : true,
    credentials: true,
  })
);

// 6. JSON parsing with payload limit protection
app.use(express.json({ limit: "1mb" }));

// 7. Active Database health probe
app.get("/health", async (_req, res) => {
  try {
    const { error } = await supabase.from("movies").select("id").limit(1);

    if (error) {
      return res.status(503).json({
        status: "error",
        message: "Database unreachable",
        details: error.message,
      });
    }
    res.status(200).json({ status: "ok" });
  } catch (err) {
    res.status(503).json({
      status: "error",
      message: "Database unreachable",
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

app.get("/", (_req, res) => {
  res.json({ message: "Movies API running" });
});

app.use("/api/movies", moviesRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
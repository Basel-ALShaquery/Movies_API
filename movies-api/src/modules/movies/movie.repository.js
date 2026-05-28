import { supabase } from "../../config/supabase.js";
import { AppError } from "../../errors/AppError.js";

const TABLE = "movies";

function normalizePagination(page, limit) {
  const p = Number.isFinite(Number(page)) ? Number(page) : 1;
  const l = Number.isFinite(Number(limit)) ? Number(limit) : 10;

  const safePage = Math.max(1, Math.min(10_000, Math.trunc(p)));
  const safeLimit = Math.min(100, Math.max(1, Math.trunc(l)));

  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  return { page: safePage, limit: safeLimit, from, to };
}

function toPagination({ page, limit, total }) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return { page, limit, total, totalPages };
}

/**
 * @param {string | undefined} search
 * @param {number | string | undefined} page
 * @param {number | string | undefined} limit
 */
export async function getAllMovies(search, page, limit) {
  const { from, to, ...p } = normalizePagination(page, limit);

  let query = supabase
    .from(TABLE)
    .select("*", { count: "exact" })
    .order("id", { ascending: true })
    .range(from, to);

  const q = typeof search === "string" ? search.trim() : "";
  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    throw AppError.internal(error.message, "DATABASE_ERROR");
  }

  return {
    data: data ?? [],
    pagination: toPagination({ ...p, total: count ?? 0 }),
  };
}

export async function getMovieById(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw AppError.internal(error.message, "DATABASE_ERROR");
  }

  if (!data) {
    throw AppError.notFound(`Movie with id ${id} not found`, "MOVIE_NOT_FOUND");
  }

  return data;
}

export async function createMovie(data) {
  const { data: created, error } = await supabase
    .from(TABLE)
    .insert(data)
    .select("*")
    .single();

  if (error) {
    throw AppError.internal(error.message, "DATABASE_ERROR");
  }

  return created;
}

export async function updateMovie(id, data) {
  const { data: updated, error } = await supabase
    .from(TABLE)
    .update(data)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw AppError.internal(error.message, "DATABASE_ERROR");
  }

  if (!updated) {
    throw AppError.notFound(`Movie with id ${id} not found`, "MOVIE_NOT_FOUND");
  }

  return updated;
}

export async function deleteMovie(id) {
  const { data: deleted, error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw AppError.internal(error.message, "DATABASE_ERROR");
  }

  if (!deleted) {
    throw AppError.notFound(`Movie with id ${id} not found`, "MOVIE_NOT_FOUND");
  }

  return deleted;
}


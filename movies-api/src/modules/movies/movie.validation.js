import { z } from "zod";

const CURRENT_YEAR = new Date().getFullYear();
const MIN_RELEASE_YEAR = 1888;

export const titleSchema = z
  .string({ required_error: "Title is required" })
  .trim()
  .min(1, "Title cannot be empty")
  .max(200, "Title must be at most 200 characters");

export const yearSchema = z.coerce
  .number({ invalid_type_error: "Year must be a number" })
  .int("Year must be an integer")
  .min(MIN_RELEASE_YEAR, `Year must be at least ${MIN_RELEASE_YEAR}`)
  .max(CURRENT_YEAR + 1, `Year must be at most ${CURRENT_YEAR + 1}`);

export const genreSchema = z
  .string({ required_error: "Genre is required" })
  .trim()
  .min(1, "Genre cannot be empty")
  .max(100, "Genre must be at most 100 characters");

/**
 * Route params schema.
 * - Use with `validateParams(movieIdSchema)` middleware.
 */
export const movieIdSchema = z.object({
  id: z.string().uuid("Id must be a valid UUID"),
});

export const createMovieSchema = z.object({
  title: titleSchema,
  year: yearSchema,
  genre: genreSchema,
});

export const updateMovieSchema = createMovieSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one of title, year, or genre must be provided",
    path: ["_root"],
  });

export const movieListQuerySchema = z.object({
  /**
   * Title search (case-insensitive) used with Supabase `ilike`.
   * Optional to keep endpoint flexible.
   */
  search: z
    .string()
    .trim()
    .min(1, "Search cannot be empty")
    .max(100, "Search must be at most 100 characters")
    .optional(),

  /** 1-based page number */
  page: z.coerce
    .number({ invalid_type_error: "Page must be a number" })
    .int("Page must be an integer")
    .positive("Page must be a positive integer")
    .optional(),

  /** Page size (clamped in repository) */
  limit: z.coerce
    .number({ invalid_type_error: "Limit must be a number" })
    .int("Limit must be an integer")
    .positive("Limit must be a positive integer")
    .max(100, "Limit must be at most 100")
    .optional(),
});


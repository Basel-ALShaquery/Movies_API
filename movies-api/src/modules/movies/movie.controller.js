import * as movieService from "./movie.service.js";

/**
 * Get all movies with optional search and pagination.
 * 
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function listMovies(req, res) {
  const { search, page, limit } = req.query;
  
  const result = await movieService.listMoviesWithPagination(
    search,
    page ? parseInt(page, 10) : undefined,
    limit ? parseInt(limit, 10) : undefined
  );

  res.status(200).json({
    success: true,
    data: result.data,
    meta: result.pagination,
  });
}

/**
 * Get a single movie by ID.
 * 
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function getMovie(req, res) {
  const { id } = req.params;
  const movie = await movieService.getMovieById(id);

  res.status(200).json({
    success: true,
    data: movie,
  });
}

/**
 * Create a new movie.
 * 
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function createMovie(req, res) {
  const movie = await movieService.createMovie(req.body);

  res.status(201).json({
    success: true,
    data: movie,
  });
}

/**
 * Update an existing movie.
 * 
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function updateMovie(req, res) {
  const { id } = req.params;
  const movie = await movieService.updateMovie(id, req.body);

  res.status(200).json({
    success: true,
    data: movie,
  });
}

/**
 * Delete a movie.
 * 
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function deleteMovie(req, res) {
  const { id } = req.params;
  await movieService.deleteMovie(id);

  res.status(200).json({
    success: true,
    message: "Movie deleted successfully",
  });
}

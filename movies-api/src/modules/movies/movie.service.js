import * as movieRepository from "./movie.repository.js";

export async function listMoviesWithPagination(search, page, limit) {
  const s = typeof search === "string" && search.trim() ? search.trim() : undefined;
  const p = page ?? 1;
  const l = limit ?? 100;

  return movieRepository.getAllMovies(s, p, l);
}

export async function listMovies(search, page, limit) {
  const result = await listMoviesWithPagination(search, page, limit);
  return result.data;
}

export async function getMovieById(id) {
  return movieRepository.getMovieById(id);
}

export async function createMovie(data) {
  return movieRepository.createMovie(data);
}

export async function updateMovie(id, data) {
  return movieRepository.updateMovie(id, data);
}

export async function deleteMovie(id) {
  return movieRepository.deleteMovie(id);
}


import { Router } from "express";
import * as movieController from "./movie.controller.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import {
  validateBody,
  validateParams,
  validateQuery,
  validate,
} from "../../middleware/validate.js";
import {
  createMovieSchema,
  movieIdSchema,
  movieListQuerySchema,
  updateMovieSchema,
} from "./movie.validation.js";

const router = Router();

/**
 * @route   GET /api/movies
 * @desc    Get all movies with optional search and pagination
 * @access  Public
 */
router.get(
  "/",
  validateQuery(movieListQuerySchema),
  movieController.listMovies
);

/**
 * @route   GET /api/movies/:id
 * @desc    Get a single movie by ID
 * @access  Public
 */
router.get(
  "/:id",
  validateParams(movieIdSchema),
  movieController.getMovie
);

/**
 * @route   POST /api/movies
 * @desc    Create a new movie
 * @access  Private (API Key)
 */
router.post(
  "/",
  requireAuth,
  validateBody(createMovieSchema),
  movieController.createMovie
);

/**
 * @route   PATCH /api/movies/:id
 * @desc    Update an existing movie
 * @access  Private (API Key)
 */
router.patch(
  "/:id",
  requireAuth,
  validate({
    params: movieIdSchema,
    body: updateMovieSchema,
  }),
  movieController.updateMovie
);

/**
 * @route   DELETE /api/movies/:id
 * @desc    Delete a movie
 * @access  Private (API Key)
 */
router.delete(
  "/:id",
  requireAuth,
  validateParams(movieIdSchema),
  movieController.deleteMovie
);

export default router;

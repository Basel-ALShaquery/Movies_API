import { buildNotFoundResponse } from "../lib/errorResponse.js";

/**
 * Catch-all for unmatched routes. Register after all route handlers.
 *
 * @type {import("express").RequestHandler}
 */
export function notFound(req, res) {
  res.status(404).json(buildNotFoundResponse(req));
}

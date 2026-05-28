import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";
import { buildValidationErrorResponse } from "../lib/validation.js";
import {
  buildErrorResponse,
  logHttpError,
  normalizeError,
  resolvePublicMessage,
  resolveStatusCode,
} from "../lib/errorResponse.js";

/**
 * Global Express error handler (must be registered last).
 *
 * @param {unknown} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */
export function errorHandler(err, req, res, _next) {
  if (res.headersSent) {
    return;
  }

  if (err instanceof ZodError) {
    logHttpError(err, req, 400);
    return res.status(400).json(buildValidationErrorResponse(err));
  }

  if (err instanceof AppError) {
    logHttpError(err, req, err.statusCode);
    const response = res.status(err.statusCode);
    if (err.headers) {
      for (const [key, value] of Object.entries(err.headers)) {
        response.setHeader(key, value);
      }
    }
    return response.json(
      buildErrorResponse({
        code: err.code ?? "APP_ERROR",
        message: err.message,
        statusCode: err.statusCode,
        details: err.details,
        err,
      })
    );
  }

  if (
    err instanceof SyntaxError &&
    "status" in err &&
    err.status === 400 &&
    "body" in err
  ) {
    const statusCode = 400;
    logHttpError(err, req, statusCode);
    return res.status(statusCode).json(
      buildErrorResponse({
        code: "INVALID_JSON",
        message: "Invalid JSON request body",
        statusCode,
        err: normalizeError(err),
      })
    );
  }

  const error = normalizeError(err);
  const statusCode = resolveStatusCode(err);

  logHttpError(error, req, statusCode);

  const message = resolvePublicMessage(statusCode, error.message, false);

  res.status(statusCode).json(
    buildErrorResponse({
      code: statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
      message,
      statusCode,
      err: error,
    })
  );
}

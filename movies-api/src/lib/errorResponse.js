import { AppError } from "../errors/AppError.js";
import { config } from "../config/env.js";

/** @returns {boolean} */
export function isDevelopment() {
  return !config.isProd;
}

/**
 * @param {number} statusCode
 * @returns {boolean}
 */
export function isClientError(statusCode) {
  return statusCode >= 400 && statusCode < 500;
}

/**
 * @param {unknown} err
 * @returns {number}
 */
export function resolveStatusCode(err) {
  if (err instanceof AppError) {
    return err.statusCode;
  }

  if (
    err instanceof SyntaxError &&
    "status" in err &&
    err.status === 400 &&
    "body" in err
  ) {
    return 400;
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    typeof err.statusCode === "number" &&
    err.statusCode >= 400 &&
    err.statusCode < 600
  ) {
    return err.statusCode;
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof err.status === "number" &&
    err.status >= 400 &&
    err.status < 600
  ) {
    return err.status;
  }

  return 500;
}

/**
 * @param {unknown} err
 * @returns {Error}
 */
export function normalizeError(err) {
  if (err instanceof Error) {
    return err;
  }
  if (typeof err === "string") {
    return new Error(err);
  }
  return new Error("Unknown error");
}

/**
 * @param {object} options
 * @param {string} options.code
 * @param {string} options.message
 * @param {number} options.statusCode
 * @param {unknown} [options.details]
 * @param {Error} [options.err]
 */
/**
 * @param {import("express").Request} req
 */
export function buildNotFoundResponse(req) {
  return buildErrorResponse({
    code: "NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} not found`,
    statusCode: 404,
  });
}

export function buildErrorResponse({ code, message, statusCode, details, err }) {
  /** @type {{ code: string; message: string; details?: unknown; stack?: string }} */
  const error = { code, message };

  if (details !== undefined) {
    error.details = details;
  }

  if (isDevelopment() && err?.stack) {
    error.stack = err.stack;
  }

  return {
    success: false,
    error,
  };
}

/**
 * Hide internal error details in production for non-operational failures.
 *
 * @param {number} statusCode
 * @param {string} message
 * @param {boolean} [isOperational=false]
 */
export function resolvePublicMessage(statusCode, message, isOperational = false) {
  if (statusCode < 500) {
    return message;
  }
  if (isDevelopment() || isOperational) {
    return message;
  }
  return "Internal server error";
}

/**
 * @param {unknown} err
 * @param {import("express").Request} req
 * @param {number} statusCode
 */
export function logHttpError(err, req, statusCode) {
  const log = req.log ?? console;
  const meta = {
    err,
    statusCode,
    method: req.method,
    path: req.originalUrl,
  };

  if (statusCode >= 500) {
    log.error(meta, err instanceof Error ? err.message : "Server error");
  } else {
    log.warn(meta, err instanceof Error ? err.message : "Client error");
  }
}

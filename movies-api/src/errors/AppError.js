export class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} [statusCode=500]
   * @param {string} [code]
   * @param {unknown} [details]
   */
  constructor(message, statusCode = 500, code, details) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }

  static badRequest(message, code, details) {
    return new AppError(message, 400, code ?? "BAD_REQUEST", details);
  }

  static unauthorized(message = "Unauthorized", code) {
    return new AppError(message, 401, code ?? "UNAUTHORIZED");
  }

  static forbidden(message = "Forbidden", code) {
    return new AppError(message, 403, code ?? "FORBIDDEN");
  }

  static notFound(message = "Resource not found", code) {
    return new AppError(message, 404, code ?? "NOT_FOUND");
  }

  static conflict(message, code, details) {
    return new AppError(message, 409, code ?? "CONFLICT", details);
  }

  static internal(message = "Internal server error", code) {
    return new AppError(message, 500, code ?? "INTERNAL_ERROR");
  }
}

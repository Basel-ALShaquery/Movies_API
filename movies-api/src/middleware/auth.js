import { config } from "../config/env.js";
import { AppError } from "../errors/AppError.js";

export function requireApiKey(req, _res, next) {
  const apiKey = config.apiKey;

  if (!apiKey) {
    return next(AppError.internal("API key not configured on server"));
  }

  const header = req.headers.authorization;

  if (!header) {
    return next(unauthorized("Missing Authorization header"));
  }

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(unauthorized("Invalid Authorization format. Use: Bearer <key>"));
  }

  if (token !== apiKey) {
    return next(unauthorized("Invalid API key"));
  }

  next();
}

function unauthorized(message) {
  const err = AppError.unauthorized(message);
  err.headers = { "WWW-Authenticate": 'Bearer realm="api"' };
  return err;
}

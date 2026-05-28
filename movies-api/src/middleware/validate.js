/**
 * Reusable Zod validation middleware for Express.
 *
 * @example
 * router.post("/", validateBody(createMovieSchema), createMovie);
 * router.get("/:id", validateParams(idParamsSchema), getById);
 * router.get("/", validateQuery(listQuerySchema), list);
 * router.patch("/:id", validate({ params: idParamsSchema, body: updateSchema }), update);
 */

/**
 * @typedef {import("zod").ZodTypeAny} ZodSchema
 * @typedef {{ body?: ZodSchema; params?: ZodSchema; query?: ZodSchema }} ValidationSchemas
 */

/**
 * @param {ValidationSchemas} schemas
 * @returns {import("express").RequestHandler}
 */
export function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        Object.defineProperty(req, "query", {
          value: parsedQuery,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * @param {ZodSchema} schema
 * @returns {import("express").RequestHandler}
 */
export function validateBody(schema) {
  return validate({ body: schema });
}

/**
 * @param {ZodSchema} schema
 * @returns {import("express").RequestHandler}
 */
export function validateParams(schema) {
  return validate({ params: schema });
}

/**
 * @param {ZodSchema} schema
 * @returns {import("express").RequestHandler}
 */
export function validateQuery(schema) {
  return validate({ query: schema });
}

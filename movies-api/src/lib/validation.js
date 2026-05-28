/**
 * @param {import("zod").ZodIssue[]} issues
 * @returns {{ path: string; message: string; code: string }[]}
 */
export function formatZodIssues(issues) {
  return issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.map(String).join(".") : "_root",
    message: issue.message,
    code: issue.code,
  }));
}

/**
 * @param {import("zod").ZodError} error
 */
export function buildValidationErrorResponse(error) {
  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Invalid request data",
      details: formatZodIssues(error.issues),
    },
  };
}

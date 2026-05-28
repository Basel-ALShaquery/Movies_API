import pino from "pino";
import { config } from "./env.js";

const isDev = config.isDev;

const transport = isDev
  ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
        ignore: "pid,hostname",
        messageFormat: "{msg}",
      },
    }
  : undefined;

export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
    redact: ["req.headers.authorization"],
    ...(isDev
      ? {}
      : {
          // Production: include timestamp as epoch ms for log aggregators
          timestamp: pino.stdTimeFunctions.epochTime,
          formatters: {
            level(label) {
              return { level: label };
            },
          },
        }),
    serializers: {
      // Ensures Error objects are fully serialised in JSON mode
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
    },
  },
  transport ? pino.transport(transport) : undefined
);

/**
 * Log an error with optional context.
 *
 * @param {Error} err
 * @param {string} [msg]
 * @param {Record<string, unknown>} [ctx]
 */
export function logError(err, msg, ctx = {}) {
  logger.error({ err, ...ctx }, msg ?? err.message);
}
import "./config/env.js";
import app from "./app.js";
import { config } from "./config/env.js";
import { logger } from "./config/logger.js";

const SHUTDOWN_TIMEOUT_MS = 10_000;

/** @type {import("node:http").Server | undefined} */
let server;
let isShuttingDown = false;

/**
 * @param {string} reason
 * @param {number} [exitCode=0]
 */
function shutdown(reason, exitCode = 0) {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  logger.info({ reason }, "Shutting down gracefully");

  const forceExitTimer = setTimeout(() => {
    logger.error({ reason }, "Forced shutdown after timeout");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExitTimer.unref();

  const finish = (code) => {
    clearTimeout(forceExitTimer);
    logger.flush(() => {
      process.exit(code);
    });
  };

  if (!server) {
    finish(exitCode);
    return;
  }

  server.close((err) => {
    if (err) {
      logger.error({ err, reason }, "Error while closing HTTP server");
      finish(1);
      return;
    }
    logger.info({ reason }, "HTTP server closed");
    finish(exitCode);
  });
}

function registerProcessHandlers() {
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception");
    shutdown("uncaughtException", 1);
  });

  process.on("unhandledRejection", (reason) => {
    const err = reason instanceof Error ? reason : new Error(String(reason));
    logger.fatal({ err, reason }, "Unhandled promise rejection");
    shutdown("unhandledRejection", 1);
  });
}

function start() {
  registerProcessHandlers();

  server = app.listen(config.port, () => {
    logger.info({ port: config.port }, "Server started");
  });

  server.on("error", (err) => {
    logger.fatal({ err, port: config.port }, "Failed to start server");
    process.exit(1);
  });
}

start();

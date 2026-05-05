/**
 * Structured logger using Pino.
 * - Production: JSON output (ingested by Datadog / Logtail / Grafana Loki)
 * - Development: pretty-printed via pino-pretty
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.info({ userId }, "User logged in");
 *   logger.error({ err, route: "/api/auth/login" }, "Login failed");
 */
import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  }),
  base: {
    app: "visahub",
    env: process.env.NODE_ENV,
  },
  redact: {
    // Never log sensitive fields
    paths: ["password", "passwordHash", "token", "*.token", "*.secret", "authorization"],
    censor: "[REDACTED]",
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

/** Scoped child logger — attach module/route context */
export function createLogger(module: string) {
  return logger.child({ module });
}

/** Log API errors consistently */
export function logApiError(route: string, err: unknown, extra?: Record<string, unknown>) {
  logger.error({ err, route, ...extra }, `[${route}] API error`);
}

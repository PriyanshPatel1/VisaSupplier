/**
 * Next.js instrumentation hook.
 * Auto-loaded by Next.js 15+ — initialises server-side error logging via pino.
 */
import pino from "pino";

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "warn" : "debug",
  ...(process.env.NODE_ENV !== "production" && {
    transport: { target: "pino-pretty", options: { colorize: true } },
  }),
});

export async function register() {
  logger.info("Instrumentation registered");
}

export const onRequestError = (
  err: unknown,
  request: { path: string; method: string },
  context: { routeType: string }
) => {
  const error = err instanceof Error ? err : new Error(String(err));

  logger.error(
    {
      err: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      request: {
        path: request.path,
        method: request.method,
      },
      routeType: context.routeType,
    },
    "Request error"
  );
};


import { startWorkers } from "../lib/queue";
import { logger } from "../lib/logger";

logger.info("Starting VisaHub background workers...");

startWorkers();

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received — shutting down workers");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received — shutting down workers");
  process.exit(0);
});

import { createServer } from "http";
import { app } from "./app";
import { env } from "./config/env";
import { bootstrapDatabase } from "./db/bootstrap";
import { logger } from "./config/logger";
import { pool } from "./db/connection";
import { initializeSocket } from "./services/socketService";

const server = createServer(app);
initializeSocket(server);

const start = async () => {
  await pool.getConnection();
  await bootstrapDatabase();
  server.listen(env.PORT, () => {
    logger.info(`PulseWatch backend listening on port ${env.PORT}`);
  });
};

start().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});

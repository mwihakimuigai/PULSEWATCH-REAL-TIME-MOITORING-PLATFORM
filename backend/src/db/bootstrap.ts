import { RowDataPacket } from "mysql2";
import { env } from "../config/env";
import { pool } from "./connection";

const columnExists = async (columnName: string) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = 'alerts'
       AND COLUMN_NAME = ?`,
    [env.DB_NAME, columnName]
  );
  return rows.length > 0;
};

const indexExists = async (indexName: string) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT INDEX_NAME
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = 'alerts'
       AND INDEX_NAME = ?`,
    [env.DB_NAME, indexName]
  );
  return rows.length > 0;
};

export const bootstrapDatabase = async () => {
  if (!(await columnExists("status"))) {
    await pool.execute(`
      ALTER TABLE alerts
      ADD COLUMN status ENUM('resolved', 'unresolved') NOT NULL DEFAULT 'unresolved'
    `);
  }

  if (!(await columnExists("resolved_at"))) {
    await pool.execute(`
      ALTER TABLE alerts
      ADD COLUMN resolved_at TIMESTAMP NULL DEFAULT NULL
    `);
  }

  if (!(await indexExists("idx_alerts_status"))) {
    await pool.execute(`
      CREATE INDEX idx_alerts_status ON alerts (status)
    `);
  }
};

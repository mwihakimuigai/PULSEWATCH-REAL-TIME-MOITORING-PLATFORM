import { RowDataPacket } from "mysql2";
import { pool } from "../db/connection";
import { Alert } from "../types/models";

export const alertModel = {
  async createAlert(eventId: number, triggerType: string) {
    const [result] = await pool.execute(
      "INSERT INTO alerts (event_id, trigger_type, status) VALUES (?, ?, 'unresolved')",
      [eventId, triggerType]
    );
    const [rows] = await pool.execute<(Alert & RowDataPacket)[]>(
      "SELECT * FROM alerts WHERE id = ? LIMIT 1",
      [(result as { insertId: number }).insertId]
    );
    return rows[0];
  },

  async getRecentAlerts(limit = 20, status?: string) {
    const safeLimit = Math.max(1, Math.floor(limit));
    const params: Array<number | string> = [];
    let where = "";
    if (status) {
      where = "WHERE a.status = ?";
      params.push(status);
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT a.id, a.event_id, a.trigger_type, a.status, a.resolved_at, a.created_at,
              e.type AS event_type, e.message, e.severity, e.source
       FROM alerts a
       INNER JOIN events e ON e.id = a.event_id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT ${safeLimit}`,
      params
    );
    return rows;
  },

  async resolveAlert(id: number) {
    await pool.execute(
      "UPDATE alerts SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT a.id, a.event_id, a.trigger_type, a.status, a.resolved_at, a.created_at,
              e.type AS event_type, e.message, e.severity, e.source
       FROM alerts a
       INNER JOIN events e ON e.id = a.event_id
       WHERE a.id = ?
       LIMIT 1`,
      [id]
    );
    return rows;
  }
};

import { RowDataPacket } from "mysql2";
import { pool } from "../db/connection";
import { Event } from "../types/models";

export interface EventFilters {
  type?: string;
  severity?: string;
  source?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

const buildWhereClause = (filters: EventFilters) => {
  const clauses: string[] = [];
  const params: Array<string | number> = [];

  if (filters.type) {
    clauses.push("type = ?");
    params.push(filters.type);
  }
  if (filters.severity) {
    clauses.push("severity = ?");
    params.push(filters.severity);
  }
  if (filters.source) {
    clauses.push("source = ?");
    params.push(filters.source);
  }
  if (filters.search) {
    clauses.push("message LIKE ?");
    params.push(`%${filters.search}%`);
  }
  if (filters.startDate) {
    clauses.push("created_at >= ?");
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    clauses.push("created_at <= ?");
    params.push(filters.endDate);
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params
  };
};

export const eventModel = {
  async createEvent(input: Omit<Event, "id" | "created_at"> & { createdAt?: string }) {
    const query = input.createdAt
      ? "INSERT INTO events (type, message, severity, source, created_at) VALUES (?, ?, ?, ?, ?)"
      : "INSERT INTO events (type, message, severity, source) VALUES (?, ?, ?, ?)";
    const params = input.createdAt
      ? [input.type, input.message, input.severity, input.source, input.createdAt]
      : [input.type, input.message, input.severity, input.source];

    const [result] = await pool.execute(query, params);

    const eventId = (result as { insertId: number }).insertId;
    const [rows] = await pool.execute<(Event & RowDataPacket)[]>(
      "SELECT * FROM events WHERE id = ? LIMIT 1",
      [eventId]
    );
    return rows[0];
  },

  async getEvents(filters: EventFilters) {
    const { where, params } = buildWhereClause(filters);
    const pageSize = Math.max(1, Math.floor(filters.pageSize));
    const offset = Math.max(0, (Math.max(1, Math.floor(filters.page)) - 1) * pageSize);

    const [rows] = await pool.execute<(Event & RowDataPacket)[]>(
      `SELECT * FROM events ${where} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`,
      params
    );

    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM events ${where}`,
      params
    );

    return {
      data: rows,
      total: Number(countRows[0].total)
    };
  },

  async getHighSeverityCountSince(sinceIso: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM events WHERE severity = 'high' AND created_at >= ?",
      [sinceIso]
    );
    return Number(rows[0].count);
  },

  async getEventById(id: number) {
    const [rows] = await pool.execute<(Event & RowDataPacket)[]>(
      "SELECT * FROM events WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] ?? null;
  },

  async getEventsOverTime(startDate?: string, endDate?: string) {
    const params: string[] = [];
    const clauses: string[] = [];

    if (startDate) {
      clauses.push("created_at >= ?");
      params.push(startDate);
    }
    if (endDate) {
      clauses.push("created_at <= ?");
      params.push(endDate);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT DATE(created_at) AS day, COUNT(*) AS count
       FROM events
       ${where}
       GROUP BY DATE(created_at)
       ORDER BY day ASC`,
      params
    );
    return rows;
  },

  async getEventTypeBreakdown(startDate?: string, endDate?: string) {
    const params: string[] = [];
    const clauses: string[] = [];

    if (startDate) {
      clauses.push("created_at >= ?");
      params.push(startDate);
    }
    if (endDate) {
      clauses.push("created_at <= ?");
      params.push(endDate);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT type, COUNT(*) AS count
       FROM events
       ${where}
       GROUP BY type
       ORDER BY count DESC`,
      params
    );
    return rows;
  },

  async getSeverityBreakdown(startDate?: string, endDate?: string) {
    const params: string[] = [];
    const clauses: string[] = [];

    if (startDate) {
      clauses.push("created_at >= ?");
      params.push(startDate);
    }
    if (endDate) {
      clauses.push("created_at <= ?");
      params.push(endDate);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT severity, COUNT(*) AS count
       FROM events
       ${where}
       GROUP BY severity
       ORDER BY FIELD(severity, 'high', 'medium', 'low')`,
      params
    );
    return rows;
  },

  async getActivityHeatmap(startDate?: string, endDate?: string) {
    const params: string[] = [];
    const clauses: string[] = [];

    if (startDate) {
      clauses.push("created_at >= ?");
      params.push(startDate);
    }
    if (endDate) {
      clauses.push("created_at <= ?");
      params.push(endDate);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT DAYOFWEEK(created_at) AS weekDay, HOUR(created_at) AS hour, COUNT(*) AS count
       FROM events
       ${where}
       GROUP BY DAYOFWEEK(created_at), HOUR(created_at)
       ORDER BY weekDay ASC, hour ASC`,
      params
    );
    return rows;
  },

  async getSourceBreakdown(startDate?: string, endDate?: string) {
    const params: string[] = [];
    const clauses: string[] = [];

    if (startDate) {
      clauses.push("created_at >= ?");
      params.push(startDate);
    }
    if (endDate) {
      clauses.push("created_at <= ?");
      params.push(endDate);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT source, COUNT(*) AS count
       FROM events
       ${where}
       GROUP BY source
       ORDER BY count DESC`,
      params
    );
    return rows;
  },

  async getSeverityByType(startDate?: string, endDate?: string) {
    const params: string[] = [];
    const clauses: string[] = [];

    if (startDate) {
      clauses.push("created_at >= ?");
      params.push(startDate);
    }
    if (endDate) {
      clauses.push("created_at <= ?");
      params.push(endDate);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
          type,
          SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) AS low,
          SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) AS medium,
          SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) AS high
       FROM events
       ${where}
       GROUP BY type
       ORDER BY type ASC`,
      params
    );
    return rows;
  }
};

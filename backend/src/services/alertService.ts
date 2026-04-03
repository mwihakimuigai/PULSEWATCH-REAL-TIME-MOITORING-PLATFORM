import { env } from "../config/env";
import { alertModel } from "../models/alertModel";
import { eventModel } from "../models/eventModel";

export const alertService = {
  async evaluateHighSeverityThreshold(eventId: number) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const highSeverityCount = await eventModel.getHighSeverityCountSince(oneHourAgo);

    if (highSeverityCount >= env.HIGH_SEVERITY_THRESHOLD) {
      return alertModel.createAlert(eventId, "high_severity_threshold");
    }

    return null;
  },

  async getRecentAlerts(limit?: number, status?: string) {
    return alertModel.getRecentAlerts(limit, status);
  },

  async resolveAlert(id: number) {
    const rows = await alertModel.resolveAlert(id);
    return rows[0] ?? null;
  }
};

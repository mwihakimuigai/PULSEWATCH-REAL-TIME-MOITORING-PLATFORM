import { alertService } from "./alertService";
import { eventModel } from "../models/eventModel";

export const analyticsService = {
  async getDashboardData(query: { startDate?: string; endDate?: string }) {
    const [eventsOverTime, eventsByType, severityDistribution, severityByType, sourceBreakdown, activityHeatmap, alerts] =
      await Promise.all([
        eventModel.getEventsOverTime(query.startDate, query.endDate),
        eventModel.getEventTypeBreakdown(query.startDate, query.endDate),
        eventModel.getSeverityBreakdown(query.startDate, query.endDate),
        eventModel.getSeverityByType(query.startDate, query.endDate),
        eventModel.getSourceBreakdown(query.startDate, query.endDate),
        eventModel.getActivityHeatmap(query.startDate, query.endDate),
        alertService.getRecentAlerts(10)
      ]);

    return {
      eventsOverTime,
      eventsByType,
      severityDistribution,
      severityByType,
      sourceBreakdown,
      activityHeatmap,
      recentAlerts: alerts
    };
  }
};

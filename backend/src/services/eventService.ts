import { stringify } from "csv-stringify/sync";
import { eventModel } from "../models/eventModel";
import { alertService } from "./alertService";
import { getIo } from "./socketService";
import { AppError } from "../utils/http";
import { generateDemoEvent } from "../utils/eventFactory";

export const eventService = {
  async createEvent(input: {
    type: "error" | "info" | "warning";
    message: string;
    severity: "low" | "medium" | "high";
    source: "system" | "user";
    createdAt?: string;
  }) {
    const event = await eventModel.createEvent(input);
    const alert = await alertService.evaluateHighSeverityThreshold(event.id);

    const io = getIo();
    io.emit("event:created", event);
    if (alert) {
      io.emit("alert:created", alert);
    }

    return { event, alert };
  },

  async simulateEvents(count: number) {
    const events = [];
    const alerts = [];

    for (let index = 0; index < count; index += 1) {
      const generated = generateDemoEvent();
      const created = await this.createEvent(generated);
      events.push(created.event);
      if (created.alert) {
        alerts.push(created.alert);
      }
    }

    return { events, alerts };
  },

  async listEvents(query: {
    type?: string;
    severity?: string;
    source?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? 10);
    const result = await eventModel.getEvents({
      type: query.type,
      severity: query.severity,
      source: query.source,
      search: query.search,
      startDate: query.startDate,
      endDate: query.endDate,
      page,
      pageSize
    });

    return {
      ...result,
      page,
      pageSize,
      totalPages: Math.ceil(result.total / pageSize)
    };
  },

  async getEventById(id: number) {
    const event = await eventModel.getEventById(id);
    if (!event) {
      throw new AppError("Event not found", 404);
    }
    return event;
  },

  async exportEventsCsv(query: {
    type?: string;
    severity?: string;
    source?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const result = await eventModel.getEvents({
      ...query,
      page: 1,
      pageSize: 10000
    });

    return stringify(result.data, {
      header: true,
      columns: ["id", "type", "message", "severity", "source", "created_at"]
    });
  }
};

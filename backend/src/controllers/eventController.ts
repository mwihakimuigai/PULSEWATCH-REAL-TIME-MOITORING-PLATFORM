import { Request, Response } from "express";
import { eventService } from "../services/eventService";
import { sendCsv } from "../utils/http";

export const eventController = {
  async create(req: Request, res: Response) {
    const result = await eventService.createEvent(req.body);
    res.status(201).json(result);
  },

  async simulate(req: Request, res: Response) {
    const count = Math.min(Number(req.body.count ?? 12), 50);
    const result = await eventService.simulateEvents(count);
    res.status(201).json(result);
  },

  async list(req: Request, res: Response) {
    const result = await eventService.listEvents(req.query as Record<string, string>);
    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const event = await eventService.getEventById(Number(req.params.id));
    res.json({ data: event });
  },

  async exportCsv(req: Request, res: Response) {
    const csv = await eventService.exportEventsCsv(req.query as Record<string, string>);
    sendCsv(res, "pulsewatch-events.csv", csv);
  }
};

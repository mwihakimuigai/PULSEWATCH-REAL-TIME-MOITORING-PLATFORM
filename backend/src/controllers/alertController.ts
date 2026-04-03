import { Request, Response } from "express";
import { alertService } from "../services/alertService";

export const alertController = {
  async list(req: Request, res: Response) {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 50;
    const alerts = await alertService.getRecentAlerts(limit, status);
    res.json({ data: alerts });
  },

  async resolve(req: Request, res: Response) {
    const alert = await alertService.resolveAlert(Number(req.params.id));
    res.json({ data: alert });
  }
};

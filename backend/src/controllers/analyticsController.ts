import { Request, Response } from "express";
import { analyticsService } from "../services/analyticsService";

export const analyticsController = {
  async getDashboard(req: Request, res: Response) {
    const data = await analyticsService.getDashboardData(req.query as Record<string, string>);
    res.json(data);
  }
};

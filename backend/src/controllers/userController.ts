import { Request, Response } from "express";
import { userService } from "../services/userService";

export const userController = {
  async list(_req: Request, res: Response) {
    const users = await userService.listUsers();
    res.json({ data: users });
  },

  async updateRole(req: Request, res: Response) {
    const user = await userService.updateRole(Number(req.params.id), req.body.role);
    res.json({ data: user });
  }
};

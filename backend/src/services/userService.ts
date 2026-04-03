import { userModel } from "../models/userModel";
import { AppError } from "../utils/http";

export const userService = {
  async listUsers() {
    return userModel.listUsers();
  },

  async updateRole(id: number, role: "admin" | "user") {
    const user = await userModel.updateRole(id, role);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }
};

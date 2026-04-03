import bcrypt from "bcryptjs";
import { userModel } from "../models/userModel";
import { AppError } from "../utils/http";
import { signToken } from "../utils/jwt";

export const authService = {
  async register(input: {
    name: string;
    email: string;
    password: string;
  }) {
    const existingUser = await userModel.findByEmail(input.email);
    if (existingUser) {
      throw new AppError("Email already in use", 409);
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await userModel.createUser({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: "user"
    });

    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  },

  async login(email: string, password: string) {
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  },

  async getCurrentUser(id: number) {
    const user = await userModel.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }
};

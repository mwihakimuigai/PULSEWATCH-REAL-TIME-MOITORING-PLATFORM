import { RowDataPacket } from "mysql2";
import { pool } from "../db/connection";
import { User } from "../types/models";

export const userModel = {
  async createUser(input: Pick<User, "name" | "email" | "password" | "role">) {
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [input.name, input.email, input.password, input.role]
    );
    return { id: (result as { insertId: number }).insertId, ...input };
  },

  async findByEmail(email: string) {
    const [rows] = await pool.execute<(User & RowDataPacket)[]>(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    return rows[0] ?? null;
  },

  async findById(id: number) {
    const [rows] = await pool.execute<(User & RowDataPacket)[]>(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] ?? null;
  },

  async listUsers() {
    const [rows] = await pool.execute<(User & RowDataPacket)[]>(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    return rows;
  },

  async updateRole(id: number, role: User["role"]) {
    await pool.execute("UPDATE users SET role = ? WHERE id = ?", [role, id]);
    return this.findById(id);
  }
};

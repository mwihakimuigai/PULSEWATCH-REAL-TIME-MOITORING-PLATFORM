export type UserRole = "admin" | "user";

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

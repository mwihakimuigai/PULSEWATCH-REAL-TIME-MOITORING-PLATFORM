import { z } from "zod";

export const createEventSchema = z.object({
  type: z.enum(["error", "info", "warning"]),
  message: z.string().min(3).max(500),
  severity: z.enum(["low", "medium", "high"]),
  source: z.enum(["system", "user"])
});

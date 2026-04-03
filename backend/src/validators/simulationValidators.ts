import { z } from "zod";

export const simulateEventsSchema = z.object({
  count: z.coerce.number().int().min(1).max(50).default(12)
});

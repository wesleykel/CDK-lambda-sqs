import { z } from "zod";

export const userSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  age: z.number(),
});

export type User = z.infer<typeof userSchema>;

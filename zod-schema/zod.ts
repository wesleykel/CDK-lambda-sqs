import { z } from "zod";

export const userSchema = z.object({
  firstName: z.string().max(5),
  lastName: z.string().max(5),
  age: z.number(),
  email: z.string().email(),
});

export type User = z.infer<typeof userSchema>;

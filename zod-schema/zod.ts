import { z } from "zod";

export const userSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  postCode: z.string().min(5).max(8),
  email: z.string().email(),
});

export type User = z.infer<typeof userSchema>;

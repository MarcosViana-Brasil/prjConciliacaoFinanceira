import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(1)
});

export type LoginBody = z.infer<typeof loginBodySchema>;

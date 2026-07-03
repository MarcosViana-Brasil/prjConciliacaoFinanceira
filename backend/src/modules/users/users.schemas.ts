import { UserStatus } from '@prisma/client';
import { z } from 'zod';

export const userIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const usersListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().min(1).optional(),
  status: z.nativeEnum(UserStatus).optional()
});

export const createUserBodySchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(8),
  roleIds: z.array(z.string().uuid()).optional(),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE)
});

export const updateUserBodySchema = z.object({
  name: z.string().trim().min(2).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  roleIds: z.array(z.string().uuid()).optional(),
  metadata: z.record(z.unknown()).optional()
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;
export type UsersListQuery = z.infer<typeof usersListQuerySchema>;
export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

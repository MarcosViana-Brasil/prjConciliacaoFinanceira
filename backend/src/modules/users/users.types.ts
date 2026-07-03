import type { UserStatus } from '@prisma/client';

export type UserListFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  roleIds?: string[];
  status?: UserStatus;
};

export type UpdateUserInput = {
  name?: string;
  status?: UserStatus;
  roleIds?: string[];
  metadata?: unknown;
};

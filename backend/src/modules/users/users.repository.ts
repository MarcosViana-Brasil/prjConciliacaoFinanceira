import type { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/prisma.js';
import { toInputJson } from '../../shared/utils/json.js';
import { buildPagination, normalizePagination } from '../../shared/utils/pagination.js';
import type { CreateUserInput, UpdateUserInput, UserListFilters } from './users.types.js';

const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  status: true,
  lastLoginAt: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  roles: {
    select: {
      role: {
        select: {
          id: true,
          name: true,
          description: true
        }
      }
    }
  }
} satisfies Prisma.UserSelect;

export class UsersRepository {
  async list(filters: UserListFilters) {
    const { page, limit, skip, take } = normalizePagination(filters);
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      status: filters.status,
      OR: filters.search
        ? [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } }
          ]
        : undefined
    };

    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: userPublicSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.user.count({ where })
    ]);

    return { data, pagination: buildPagination(page, limit, total) };
  }

  async findById(id: string) {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: userPublicSelect
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });
  }

  async create(input: CreateUserInput & { passwordHash: string }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash: input.passwordHash,
          status: input.status,
          roles: input.roleIds?.length
            ? {
                create: input.roleIds.map((roleId) => ({ roleId }))
              }
            : undefined
        },
        select: userPublicSelect
      });

      return user;
    });
  }

  async update(id: string, input: UpdateUserInput) {
    return prisma.$transaction(async (tx) => {
      if (input.roleIds) {
        await tx.userRole.deleteMany({ where: { userId: id } });

        if (input.roleIds.length) {
          await tx.userRole.createMany({
            data: input.roleIds.map((roleId) => ({ userId: id, roleId })),
            skipDuplicates: true
          });
        }
      }

      return tx.user.update({
        where: { id },
        data: {
          name: input.name,
          status: input.status,
          metadata: input.metadata === undefined ? undefined : toInputJson(input.metadata)
        },
        select: userPublicSelect
      });
    });
  }

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
      select: userPublicSelect
    });
  }
}

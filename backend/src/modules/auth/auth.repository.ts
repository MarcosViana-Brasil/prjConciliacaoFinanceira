import { prisma } from '../../shared/database/prisma.js';

export class AuthRepository {
  async findUserForLogin(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        status: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
                description: true
              }
            }
          }
        }
      }
    });
  }

  async touchLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() }
    });
  }
}

import { AuditAction } from '@prisma/client';
import { auditService } from '../auditoria/audit.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { RequestContext } from '../../shared/http/request-context.js';
import { hashPassword } from '../../shared/utils/hash.js';
import { UsersRepository } from './users.repository.js';
import type { CreateUserInput, UpdateUserInput, UserListFilters } from './users.types.js';

export class UsersService {
  constructor(private readonly usersRepository = new UsersRepository()) {}

  async list(filters: UserListFilters) {
    return this.usersRepository.list(filters);
  }

  async getById(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new AppError('Usuario nao encontrado', 404, 'USER_NOT_FOUND');
    }

    return user;
  }

  async create(input: CreateUserInput, context: RequestContext) {
    const existing = await this.usersRepository.findByEmail(input.email);

    if (existing) {
      throw new AppError('E-mail ja cadastrado', 409, 'USER_EMAIL_ALREADY_EXISTS');
    }

    const user = await this.usersRepository.create({
      ...input,
      passwordHash: hashPassword(input.password)
    });

    await auditService.recordEvent({
      entity: 'users',
      entityId: user.id,
      action: AuditAction.CREATE,
      userId: context.userId,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      after: user,
      metadata: { operation: 'create_user' }
    });

    return user;
  }

  async update(id: string, input: UpdateUserInput, context: RequestContext) {
    const before = await this.getById(id);
    const after = await this.usersRepository.update(id, input);

    await auditService.recordEvent({
      entity: 'users',
      entityId: id,
      action: AuditAction.UPDATE,
      userId: context.userId,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      before,
      after,
      metadata: { operation: 'update_user' }
    });

    return after;
  }

  async softDelete(id: string, context: RequestContext) {
    const before = await this.getById(id);
    const after = await this.usersRepository.softDelete(id);

    await auditService.recordEvent({
      entity: 'users',
      entityId: id,
      action: AuditAction.SOFT_DELETE,
      userId: context.userId,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      before,
      after,
      metadata: { operation: 'soft_delete_user' }
    });

    return after;
  }
}

export const usersService = new UsersService();

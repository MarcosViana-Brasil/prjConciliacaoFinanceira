import { AuditAction } from '@prisma/client';
import { auditService } from '../auditoria/audit.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { RequestContext } from '../../shared/http/request-context.js';
import { verifyPassword } from '../../shared/utils/hash.js';
import { AuthRepository } from './auth.repository.js';
import { signToken, verifyToken } from './jwt.js';

export class AuthService {
  constructor(private readonly authRepository = new AuthRepository()) {}

  async login(email: string, password: string, context: RequestContext) {
    const user = await this.authRepository.findUserForLogin(email);

    if (!user || user.status !== 'ACTIVE' || !verifyPassword(password, user.passwordHash)) {
      await auditService.recordEvent({
        entity: 'auth',
        entityId: email,
        action: AuditAction.ERROR,
        origin: context.origin,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        metadata: { operation: 'login_failed' }
      });
      throw new AppError('Credenciais invalidas', 401, 'INVALID_CREDENTIALS');
    }

    const roles = user.roles.map((userRole) => userRole.role.name);
    const token = signToken({ sub: user.id, name: user.name, email: user.email, roles });
    await this.authRepository.touchLastLogin(user.id);
    await auditService.recordEvent({
      entity: 'auth',
      entityId: user.id,
      action: AuditAction.LOGIN,
      userId: user.id,
      origin: context.origin,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      metadata: { roles }
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles
      }
    };
  }

  verifyToken(token: string) {
    const payload = verifyToken(token);
    if (!payload) return undefined;

    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      roles: payload.roles
    };
  }
}

export const authService = new AuthService();

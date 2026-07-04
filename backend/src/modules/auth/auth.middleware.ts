import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../../shared/errors/AppError.js';
import { setAuthenticatedUser } from '../../shared/http/auth-context.js';
import { authService } from './auth.service.js';

export type RoleName = 'ADMIN' | 'FINANCEIRO' | 'AUDITOR' | 'SOMENTE_LEITURA';

export async function authenticate(request: FastifyRequest, _reply: FastifyReply) {
  const authorization = request.headers.authorization;
  const token = typeof authorization === 'string' && authorization.startsWith('Bearer ') ? authorization.slice(7) : undefined;

  if (!token) {
    throw new AppError('Autenticacao obrigatoria', 401, 'AUTH_REQUIRED');
  }

  const user = authService.verifyToken(token);
  if (!user) {
    throw new AppError('Token invalido ou expirado', 401, 'INVALID_TOKEN');
  }

  setAuthenticatedUser(request, user);
}

export function requireRoles(roles: RoleName[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    const authorization = request.headers.authorization;
    const token = typeof authorization === 'string' && authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    const user = authService.verifyToken(token);

    if (!user || (!user.roles.includes('ADMIN') && !roles.some((role) => user.roles.includes(role)))) {
      throw new AppError('Acesso negado para este perfil', 403, 'FORBIDDEN');
    }
  };
}

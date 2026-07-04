import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../shared/http/api-response.js';
import { getAuthenticatedUser } from '../../shared/http/auth-context.js';
import { getRequestContext } from '../../shared/http/request-context.js';
import { validateRequest } from '../../shared/validation/validate-request.js';
import { loginBodySchema, type LoginBody } from './auth.schemas.js';
import { authService } from './auth.service.js';

export class AuthController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { body } = validateRequest<unknown, unknown, LoginBody>(request, { body: loginBodySchema });
    const result = await authService.login(body.email, body.password, getRequestContext(request));

    return reply.send(success(result, 'Login realizado com sucesso'));
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    return reply.send(success(getAuthenticatedUser(request), 'Usuario autenticado'));
  }
}

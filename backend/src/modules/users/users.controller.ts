import type { FastifyReply, FastifyRequest } from 'fastify';
import { success } from '../../shared/http/api-response.js';
import { getRequestContext } from '../../shared/http/request-context.js';
import { validateRequest } from '../../shared/validation/validate-request.js';
import {
  createUserBodySchema,
  updateUserBodySchema,
  userIdParamsSchema,
  usersListQuerySchema,
  type CreateUserBody,
  type UpdateUserBody,
  type UserIdParams,
  type UsersListQuery
} from './users.schemas.js';
import { usersService } from './users.service.js';

export class UsersController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    const { query } = validateRequest<unknown, UsersListQuery>(request, { query: usersListQuerySchema });
    const result = await usersService.list(query);

    return reply.send(success(result.data, 'Usuarios listados com sucesso', result.pagination));
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { params } = validateRequest<UserIdParams>(request, { params: userIdParamsSchema });
    const user = await usersService.getById(params.id);

    return reply.send(success(user, 'Usuario encontrado com sucesso'));
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { body } = validateRequest<unknown, unknown, CreateUserBody>(request, { body: createUserBodySchema });
    const user = await usersService.create(body, getRequestContext(request));

    return reply.status(201).send(success(user, 'Usuario criado com sucesso'));
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { params, body } = validateRequest<UserIdParams, unknown, UpdateUserBody>(request, {
      params: userIdParamsSchema,
      body: updateUserBodySchema
    });
    const user = await usersService.update(params.id, body, getRequestContext(request));

    return reply.send(success(user, 'Usuario atualizado com sucesso'));
  }

  async softDelete(request: FastifyRequest, reply: FastifyReply) {
    const { params } = validateRequest<UserIdParams>(request, { params: userIdParamsSchema });
    const user = await usersService.softDelete(params.id, getRequestContext(request));

    return reply.send(success(user, 'Usuario removido com sucesso'));
  }
}

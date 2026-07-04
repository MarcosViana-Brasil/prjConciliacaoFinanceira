import type { FastifyInstance } from 'fastify';
import { requireRoles } from '../auth/auth.middleware.js';
import { UsersController } from './users.controller.js';

export async function usersRoutes(app: FastifyInstance) {
  const controller = new UsersController();

  app.get('/users', { preHandler: requireRoles(['ADMIN']) }, controller.list.bind(controller));
  app.get('/users/:id', { preHandler: requireRoles(['ADMIN']) }, controller.getById.bind(controller));
  app.post('/users', { preHandler: requireRoles(['ADMIN']) }, controller.create.bind(controller));
  app.put('/users/:id', { preHandler: requireRoles(['ADMIN']) }, controller.update.bind(controller));
  app.delete('/users/:id', { preHandler: requireRoles(['ADMIN']) }, controller.softDelete.bind(controller));
}

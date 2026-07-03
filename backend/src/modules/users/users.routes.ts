import type { FastifyInstance } from 'fastify';
import { UsersController } from './users.controller.js';

export async function usersRoutes(app: FastifyInstance) {
  const controller = new UsersController();

  app.get('/users', controller.list.bind(controller));
  app.get('/users/:id', controller.getById.bind(controller));
  app.post('/users', controller.create.bind(controller));
  app.put('/users/:id', controller.update.bind(controller));
  app.delete('/users/:id', controller.softDelete.bind(controller));
}

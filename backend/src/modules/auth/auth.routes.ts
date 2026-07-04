import type { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller.js';
import { authenticate } from './auth.middleware.js';

export async function authRoutes(app: FastifyInstance) {
  const controller = new AuthController();

  app.post('/auth/login', controller.login.bind(controller));
  app.get('/auth/me', { preHandler: authenticate }, controller.me.bind(controller));
}

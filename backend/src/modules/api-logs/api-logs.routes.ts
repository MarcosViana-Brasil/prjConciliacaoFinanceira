import type { FastifyInstance } from 'fastify';
import { ApiLogsController } from './api-logs.controller.js';

export async function apiLogsRoutes(app: FastifyInstance) {
  const controller = new ApiLogsController();

  app.get('/api-logs', controller.list.bind(controller));
}

import type { FastifyInstance } from 'fastify';
import { JobsController } from './jobs.controller.js';

export async function jobsRoutes(app: FastifyInstance) {
  const controller = new JobsController();

  app.get('/jobs', controller.list.bind(controller));
}

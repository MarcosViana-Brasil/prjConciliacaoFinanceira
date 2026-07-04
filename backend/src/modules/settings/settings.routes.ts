import type { FastifyInstance } from 'fastify';
import { requireRoles } from '../auth/auth.middleware.js';
import { SettingsController } from './settings.controller.js';

export async function settingsRoutes(app: FastifyInstance) {
  const controller = new SettingsController();

  app.get('/settings', { preHandler: requireRoles(['ADMIN']) }, controller.list.bind(controller));
  app.put('/settings/:key', { preHandler: requireRoles(['ADMIN']) }, controller.upsert.bind(controller));
}

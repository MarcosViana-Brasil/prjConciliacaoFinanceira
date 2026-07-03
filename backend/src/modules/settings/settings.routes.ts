import type { FastifyInstance } from 'fastify';
import { SettingsController } from './settings.controller.js';

export async function settingsRoutes(app: FastifyInstance) {
  const controller = new SettingsController();

  app.get('/settings', controller.list.bind(controller));
  app.put('/settings/:key', controller.upsert.bind(controller));
}

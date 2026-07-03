import type { FastifyInstance } from 'fastify';
import { apiLogsRoutes } from './modules/api-logs/api-logs.routes.js';
import { auditRoutes } from './modules/auditoria/audit.routes.js';
import { financialTitlesRoutes } from './modules/financeiro/financial-titles.routes.js';
import { jobsRoutes } from './modules/jobs/jobs.routes.js';
import { payloadsRoutes } from './modules/payloads/payloads.routes.js';
import { settingsRoutes } from './modules/settings/settings.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';

export async function registerRoutes(app: FastifyInstance) {
  await app.register(usersRoutes, { prefix: '/api' });
  await app.register(financialTitlesRoutes, { prefix: '/api' });
  await app.register(auditRoutes, { prefix: '/api' });
  await app.register(payloadsRoutes, { prefix: '/api' });
  await app.register(apiLogsRoutes, { prefix: '/api' });
  await app.register(jobsRoutes, { prefix: '/api' });
  await app.register(settingsRoutes, { prefix: '/api' });
}

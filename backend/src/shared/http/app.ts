import cors from '@fastify/cors';
import Fastify from 'fastify';
import { registerRoutes } from '../../routes.js';
import { authenticate } from '../../modules/auth/auth.middleware.js';
import { startScheduler } from '../../modules/jobs/scheduler.js';
import { errorHandler } from '../errors/error-handler.js';
import { env } from '../utils/env.js';
import { logger } from '../logger/logger.js';

export async function buildApp() {
  const app = Fastify({
    loggerInstance: logger
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true
  });

  app.setErrorHandler(errorHandler);

  app.addHook('preHandler', async (request, reply) => {
    if (!request.url.startsWith('/api') || request.url.startsWith('/api/auth/login')) {
      return;
    }

    await authenticate(request, reply);
  });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'fip-core-backend',
    timestamp: new Date().toISOString()
  }));

  await registerRoutes(app);
  await startScheduler();

  return app;
}

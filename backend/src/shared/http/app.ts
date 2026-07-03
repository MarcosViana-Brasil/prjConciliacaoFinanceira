import cors from '@fastify/cors';
import Fastify from 'fastify';
import { registerRoutes } from '../../routes.js';
import { errorHandler } from '../errors/error-handler.js';
import { env } from '../utils/env.js';
import { logger } from '../logger/logger.js';

export async function buildApp() {
  const app = Fastify({
    logger
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true
  });

  app.setErrorHandler(errorHandler);

  app.get('/health', async () => ({
    status: 'ok',
    service: 'fip-core-backend',
    timestamp: new Date().toISOString()
  }));

  await registerRoutes(app);

  return app;
}

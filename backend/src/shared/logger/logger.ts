import type { FastifyBaseLogger } from 'fastify';
import pino from 'pino';
import { env } from '../utils/env.js';

export const logger: FastifyBaseLogger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: ['password', 'token', 'authorization', 'headers.authorization', '*.password', '*.token'],
    remove: true
  }
});


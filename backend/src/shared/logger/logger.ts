import type { FastifyBaseLogger } from 'fastify';
import pino from 'pino';
import { env } from '../utils/env.js';

export const logger: FastifyBaseLogger = pino({
  level: env.LOG_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: 'fip-core-backend',
    environment: env.NODE_ENV
  },
  redact: {
    paths: [
      'password',
      'token',
      'authorization',
      'cookie',
      'headers.authorization',
      'headers.cookie',
      '*.password',
      '*.token',
      '*.secret',
      '*.apiKey',
      '*.clientSecret',
      '*.accessToken',
      '*.refreshToken'
    ],
    censor: '[MASKED]'
  }
});

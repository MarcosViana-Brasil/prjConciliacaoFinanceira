import { buildApp } from './shared/http/app.js';
import { env } from './shared/utils/env.js';

const app = await buildApp();

try {
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
} catch (error) {
  app.log.error(error, 'Failed to start backend server');
  process.exit(1);
}


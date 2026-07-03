import 'dotenv/config';
import { z } from 'zod';

const booleanEnvSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    return value.trim().toLowerCase() === 'true';
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  REDE_BASE_URL: z.string().url().default('https://api.userede.com.br'),
  REDE_CLIENT_ID: z.string().optional(),
  REDE_CLIENT_SECRET: z.string().optional(),
  REDE_MERCHANT_ID: z.string().optional(),
  REDE_PV: z.string().optional(),
  REDE_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
  REDE_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  REDE_USE_MOCKS: booleanEnvSchema.default(true),
  REDE_TRANSACTIONS_ENDPOINT: z.string().default('/transactions'),
  REDE_RECEIVABLES_ENDPOINT: z.string().default('/receivables'),
  JOBS_ENABLED: booleanEnvSchema.default(false),
  JOB_IMPORT_REDE_TRANSACTIONS_ENABLED: booleanEnvSchema.default(false),
  JOB_IMPORT_REDE_TRANSACTIONS_CRON: z.string().default('0 6 * * *'),
  JOB_IMPORT_REDE_RECEIVABLES_ENABLED: booleanEnvSchema.default(false),
  JOB_IMPORT_REDE_RECEIVABLES_CRON: z.string().default('30 6 * * *'),
  JOB_RECONCILIATION_ENABLED: booleanEnvSchema.default(false),
  JOB_RECONCILIATION_CRON: z.string().default('0 7 * * *'),
  JOB_DEFAULT_LOOKBACK_DAYS: z.coerce.number().int().positive().default(3),
  JOB_CLEANUP_OLD_LOGS_ENABLED: booleanEnvSchema.default(false),
  JOB_CLEANUP_OLD_LOGS_CRON: z.string().default('0 3 * * 0'),
  JOB_LOG_RETENTION_DAYS: z.coerce.number().int().positive().default(90)
});

export const env = envSchema.parse(process.env);

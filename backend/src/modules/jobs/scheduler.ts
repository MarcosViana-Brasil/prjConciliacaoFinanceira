import { logger } from '../../shared/logger/logger.js';
import { env } from '../../shared/utils/env.js';
import { jobRegistry } from './job-registry.js';
import { runJob } from './job-runner.js';
import { defaultPeriod, defaultReconciliationPeriod, jobsConfig } from './jobs.config.js';
import { JOB_NAMES } from './jobs.types.js';

type ScheduledTask = {
  stop: () => void;
};

type CronLike = {
  schedule: (expression: string, task: () => void | Promise<void>) => ScheduledTask;
};

const scheduledTasks: ScheduledTask[] = [];
let started = false;

export async function startScheduler() {
  if (started || env.NODE_ENV === 'test' || !jobsConfig.enabled) {
    logger.info({ enabled: jobsConfig.enabled, nodeEnv: env.NODE_ENV }, 'Job scheduler not started');
    return;
  }

  const cron = await loadCron();
  started = true;

  scheduleIfEnabled(cron, JOB_NAMES.importRedeTransactions, jobsConfig.importRedeTransactions.enabled, jobsConfig.importRedeTransactions.cron, () =>
    runJob({
      jobName: JOB_NAMES.importRedeTransactions,
      payload: defaultPeriod(),
      handler: jobRegistry[JOB_NAMES.importRedeTransactions],
      origin: 'scheduler',
      triggeredBy: 'scheduler'
    })
  );

  scheduleIfEnabled(cron, JOB_NAMES.importRedeReceivables, jobsConfig.importRedeReceivables.enabled, jobsConfig.importRedeReceivables.cron, () =>
    runJob({
      jobName: JOB_NAMES.importRedeReceivables,
      payload: defaultPeriod(),
      handler: jobRegistry[JOB_NAMES.importRedeReceivables],
      origin: 'scheduler',
      triggeredBy: 'scheduler'
    })
  );

  scheduleIfEnabled(cron, JOB_NAMES.runReconciliation, jobsConfig.runReconciliation.enabled, jobsConfig.runReconciliation.cron, () =>
    runJob({
      jobName: JOB_NAMES.runReconciliation,
      payload: defaultReconciliationPeriod(),
      handler: jobRegistry[JOB_NAMES.runReconciliation],
      origin: 'scheduler',
      triggeredBy: 'scheduler'
    })
  );

  scheduleIfEnabled(cron, JOB_NAMES.cleanupOldLogs, jobsConfig.cleanupOldLogs.enabled, jobsConfig.cleanupOldLogs.cron, () =>
    runJob({
      jobName: JOB_NAMES.cleanupOldLogs,
      handler: jobRegistry[JOB_NAMES.cleanupOldLogs],
      origin: 'scheduler',
      triggeredBy: 'scheduler'
    })
  );
}

export function stopScheduler() {
  for (const task of scheduledTasks) {
    task.stop();
  }
  scheduledTasks.length = 0;
  started = false;
}

function scheduleIfEnabled(cron: CronLike, jobName: string, enabled: boolean, expression: string, task: () => Promise<unknown>) {
  if (!enabled) {
    logger.info({ jobName }, 'Scheduled job disabled');
    return;
  }

  const scheduledTask = cron.schedule(expression, async () => {
    try {
      await task();
    } catch (error) {
      logger.error({ jobName, errorMessage: error instanceof Error ? error.message : 'Erro inesperado' }, 'Scheduled job failed');
    }
  });
  scheduledTasks.push(scheduledTask);
  logger.info({ jobName, expression }, 'Scheduled job registered');
}

async function loadCron(): Promise<CronLike> {
  try {
    const dynamicImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<unknown>;
    const cron = (await dynamicImport('node-cron')) as CronLike | { default?: CronLike };
    return 'schedule' in cron ? cron : cron.default ?? fallbackCron();
  } catch (error) {
    logger.warn({ errorMessage: error instanceof Error ? error.message : 'node-cron indisponivel' }, 'Using fallback scheduler');
    return fallbackCron();
  }
}

function fallbackCron(): CronLike {
  return {
    schedule(expression, task) {
      const timer = setInterval(() => {
        if (matchesMinuteAndHour(expression, new Date())) {
          void task();
        }
      }, 60_000);

      return {
        stop: () => clearInterval(timer)
      };
    }
  };
}

function matchesMinuteAndHour(expression: string, date: Date) {
  const [minute = '*', hour = '*'] = expression.split(/\s+/);
  return matchesPart(minute, date.getMinutes()) && matchesPart(hour, date.getHours());
}

function matchesPart(part: string, value: number): boolean {
  if (part === '*') return true;
  if (part.includes(',')) return part.split(',').some((item) => matchesPart(item, value));
  if (part.startsWith('*/')) {
    const interval = Number(part.slice(2));
    return Number.isInteger(interval) && interval > 0 && value % interval === 0;
  }
  return Number(part) === value;
}

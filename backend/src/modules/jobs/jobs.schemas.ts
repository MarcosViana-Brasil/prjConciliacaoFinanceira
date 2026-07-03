import { JobStatus } from '@prisma/client';
import { z } from 'zod';

export const jobsListQuerySchema = z.object({
  jobName: z.string().trim().min(1).optional(),
  status: z.nativeEnum(JobStatus).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

export type JobsListQuery = z.infer<typeof jobsListQuerySchema>;

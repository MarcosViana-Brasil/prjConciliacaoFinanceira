import { z } from 'zod';

export const settingKeyParamsSchema = z.object({
  key: z.string().trim().min(1).max(120)
});

export const upsertSettingBodySchema = z.object({
  value: z.unknown().refine((value) => value !== undefined, 'value e obrigatorio'),
  description: z.string().trim().min(1).optional(),
  isEncrypted: z.boolean().optional(),
  metadata: z.unknown().optional()
});

export type SettingKeyParams = z.infer<typeof settingKeyParamsSchema>;
export type UpsertSettingBody = z.infer<typeof upsertSettingBodySchema>;

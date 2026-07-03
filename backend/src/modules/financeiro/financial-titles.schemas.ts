import { FinancialTitleStatus, GatewayProvider } from '@prisma/client';
import { z } from 'zod';

const moneySchema = z.union([
  z.string().trim().regex(/^\d+(\.\d{1,2})?$/, 'Valor monetario invalido'),
  z.number().finite().nonnegative()
]);

const nullableStringSchema = z.string().trim().min(1).nullable().optional();
const booleanQuerySchema = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((value) => (typeof value === 'boolean' ? value : value === 'true'));

export const financialTitleParamsSchema = z.object({
  id: z.string().uuid()
});

export const listFinancialTitlesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().min(1).optional(),
  status: z.nativeEnum(FinancialTitleStatus).optional(),
  customerDocument: z.string().trim().min(1).optional(),
  customerName: z.string().trim().min(1).optional(),
  titleNumber: z.string().trim().min(1).optional(),
  orderNumber: z.string().trim().min(1).optional(),
  nsu: z.string().trim().min(1).optional(),
  authorizationCode: z.string().trim().min(1).optional(),
  tid: z.string().trim().min(1).optional(),
  transactionId: z.string().trim().min(1).optional(),
  gatewayProvider: z.nativeEnum(GatewayProvider).optional(),
  dueDateStart: z.coerce.date().optional(),
  dueDateEnd: z.coerce.date().optional(),
  issueDateStart: z.coerce.date().optional(),
  issueDateEnd: z.coerce.date().optional(),
  minAmount: moneySchema.optional(),
  maxAmount: moneySchema.optional(),
  onlyDeleted: booleanQuerySchema.optional()
});

const financialTitleBaseSchema = z.object({
  externalId: nullableStringSchema,
  titleNumber: z.string().trim().min(1),
  customerName: z.string().trim().min(1),
  customerDocument: nullableStringSchema,
  orderNumber: nullableStringSchema,
  installmentNumber: z.number().int().positive().nullable().optional(),
  totalInstallments: z.number().int().positive().nullable().optional(),
  grossAmount: moneySchema,
  netAmountExpected: moneySchema.nullable().optional(),
  paidAmount: moneySchema.nullable().optional(),
  dueDate: z.coerce.date(),
  issueDate: z.coerce.date().nullable().optional(),
  paidAt: z.coerce.date().nullable().optional(),
  gatewayProvider: z.nativeEnum(GatewayProvider).nullable().optional(),
  gatewayReference: nullableStringSchema,
  nsu: nullableStringSchema,
  authorizationCode: nullableStringSchema,
  tid: nullableStringSchema,
  transactionId: nullableStringSchema,
  metadata: z.unknown().optional(),
  justification: z.string().trim().min(1).optional()
});

export const createFinancialTitleSchema = financialTitleBaseSchema.refine(
    (data) =>
      data.installmentNumber === undefined ||
      data.installmentNumber === null ||
      data.totalInstallments === undefined ||
      data.totalInstallments === null ||
      data.totalInstallments >= data.installmentNumber,
    {
      path: ['totalInstallments'],
      message: 'totalInstallments deve ser maior ou igual a installmentNumber'
    }
  );

export const updateFinancialTitleSchema = financialTitleBaseSchema
  .omit({ titleNumber: true })
  .partial()
  .extend({
    status: z.nativeEnum(FinancialTitleStatus).optional(),
    justification: z.string().trim().min(1).optional()
  });

export const cancelFinancialTitleSchema = z.object({
  justification: z.string().trim().min(1)
});

export const markFinancialTitlePaidSchema = z.object({
  paidAmount: moneySchema,
  paidAt: z.coerce.date(),
  justification: z.string().trim().min(1)
});

export const softDeleteFinancialTitleSchema = z
  .object({
    justification: z.string().trim().min(1).optional()
  })
  .default({});

export const restoreFinancialTitleSchema = z.object({
  justification: z.string().trim().min(1)
});

export const importFinancialTitlesSchema = z.object({
  source: z.string().trim().min(1),
  items: z.array(financialTitleBaseSchema.omit({ justification: true })).min(1),
  justification: z.string().trim().min(1)
});

export type FinancialTitleParams = z.infer<typeof financialTitleParamsSchema>;
export type ListFinancialTitlesQuery = z.infer<typeof listFinancialTitlesQuerySchema>;
export type CreateFinancialTitleBody = z.infer<typeof createFinancialTitleSchema>;
export type UpdateFinancialTitleBody = z.infer<typeof updateFinancialTitleSchema>;
export type CancelFinancialTitleBody = z.infer<typeof cancelFinancialTitleSchema>;
export type MarkFinancialTitlePaidBody = z.infer<typeof markFinancialTitlePaidSchema>;
export type SoftDeleteFinancialTitleBody = z.infer<typeof softDeleteFinancialTitleSchema>;
export type RestoreFinancialTitleBody = z.infer<typeof restoreFinancialTitleSchema>;
export type ImportFinancialTitlesBody = z.infer<typeof importFinancialTitlesSchema>;

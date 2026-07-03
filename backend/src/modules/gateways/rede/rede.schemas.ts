import { ReceivableStatus, RedeTransactionStatus } from '@prisma/client';
import { z } from 'zod';

const dateStringSchema = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato YYYY-MM-DD');
const moneySchema = z.union([
  z.string().trim().regex(/^-?\d+(\.\d{1,2})?$/, 'Valor monetario invalido'),
  z.number().finite()
]);

export const importRedeTransactionsSchema = z.object({
  startDate: dateStringSchema,
  endDate: dateStringSchema,
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional()
});

export const importRedeReceivablesSchema = importRedeTransactionsSchema;

export const listRedeTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  nsu: z.string().trim().min(1).optional(),
  authorizationCode: z.string().trim().min(1).optional(),
  transactionId: z.string().trim().min(1).optional(),
  tid: z.string().trim().min(1).optional(),
  orderNumber: z.string().trim().min(1).optional(),
  status: z.nativeEnum(RedeTransactionStatus).optional(),
  saleDateStart: z.coerce.date().optional(),
  saleDateEnd: z.coerce.date().optional(),
  minAmount: moneySchema.optional(),
  maxAmount: moneySchema.optional()
});

export const listRedeReceivablesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  nsu: z.string().trim().min(1).optional(),
  authorizationCode: z.string().trim().min(1).optional(),
  transactionId: z.string().trim().min(1).optional(),
  status: z.nativeEnum(ReceivableStatus).optional(),
  expectedPaymentDateStart: z.coerce.date().optional(),
  expectedPaymentDateEnd: z.coerce.date().optional(),
  actualPaymentDateStart: z.coerce.date().optional(),
  actualPaymentDateEnd: z.coerce.date().optional(),
  minAmount: moneySchema.optional(),
  maxAmount: moneySchema.optional()
});

export const redeIdParamsSchema = z.object({
  id: z.string().uuid()
});

export type ImportRedeTransactionsBody = z.infer<typeof importRedeTransactionsSchema>;
export type ImportRedeReceivablesBody = z.infer<typeof importRedeReceivablesSchema>;
export type ListRedeTransactionsQuery = z.infer<typeof listRedeTransactionsQuerySchema>;
export type ListRedeReceivablesQuery = z.infer<typeof listRedeReceivablesQuerySchema>;
export type RedeIdParams = z.infer<typeof redeIdParamsSchema>;

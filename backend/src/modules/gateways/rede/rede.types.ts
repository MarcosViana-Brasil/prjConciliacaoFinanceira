import type { ReceivableStatus, RedeTransactionStatus } from '@prisma/client';

export type RedeImportParams = {
  startDate: string;
  endDate: string;
  page?: number;
  limit?: number;
};

export type RedeImportResult = {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{
    index: number;
    identifier?: string;
    message: string;
  }>;
};

export type NormalizedRedeTransaction = {
  transactionId: string;
  tid?: string | null;
  nsu?: string | null;
  authorizationCode?: string | null;
  orderNumber?: string | null;
  saleDate?: Date | null;
  captureDate?: Date | null;
  grossAmount: string;
  netAmount?: string | null;
  feeAmount?: string | null;
  installmentNumber?: number | null;
  totalInstallments?: number | null;
  brand?: string | null;
  paymentMethod?: string | null;
  status: RedeTransactionStatus;
  establishmentCode?: string | null;
  metadata: Record<string, unknown>;
};

export type NormalizedRedeReceivable = {
  transactionId: string;
  nsu?: string | null;
  authorizationCode?: string | null;
  expectedPaymentDate?: Date | null;
  actualPaymentDate?: Date | null;
  grossAmount: string;
  netAmount?: string | null;
  feeAmount?: string | null;
  adjustmentAmount?: string | null;
  installmentNumber?: number | null;
  totalInstallments?: number | null;
  status: ReceivableStatus;
  bankCode?: string | null;
  agency?: string | null;
  account?: string | null;
  metadata: Record<string, unknown>;
};

export type RedeTransactionFilters = {
  page?: number;
  limit?: number;
  nsu?: string;
  authorizationCode?: string;
  transactionId?: string;
  tid?: string;
  orderNumber?: string;
  status?: RedeTransactionStatus;
  saleDateStart?: Date;
  saleDateEnd?: Date;
  minAmount?: string | number;
  maxAmount?: string | number;
};

export type RedeReceivableFilters = {
  page?: number;
  limit?: number;
  nsu?: string;
  authorizationCode?: string;
  transactionId?: string;
  status?: ReceivableStatus;
  expectedPaymentDateStart?: Date;
  expectedPaymentDateEnd?: Date;
  actualPaymentDateStart?: Date;
  actualPaymentDateEnd?: Date;
  minAmount?: string | number;
  maxAmount?: string | number;
};

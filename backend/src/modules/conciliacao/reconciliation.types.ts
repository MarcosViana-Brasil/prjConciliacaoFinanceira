import type {
  DivergenceSeverity,
  GatewayProvider,
  ReconciliationDivergenceType,
  ReconciliationMatchLevel,
  ReconciliationStatus
} from '@prisma/client';

export type DecimalLike = string | number | { toString(): string };

export type FinancialTitleLike = {
  id?: string;
  grossAmount: DecimalLike;
  netAmountExpected?: DecimalLike | null;
  paidAmount?: DecimalLike | null;
  dueDate?: Date | string | null;
  issueDate?: Date | string | null;
  status?: string | null;
  deletedAt?: Date | string | null;
  gatewayProvider?: GatewayProvider | null;
  nsu?: string | null;
  authorizationCode?: string | null;
  tid?: string | null;
  transactionId?: string | null;
  orderNumber?: string | null;
  installmentNumber?: number | null;
  totalInstallments?: number | null;
  customerDocument?: string | null;
};

export type RedeTransactionLike = {
  id?: string;
  grossAmount: DecimalLike;
  netAmount?: DecimalLike | null;
  saleDate?: Date | string | null;
  captureDate?: Date | string | null;
  status?: string | null;
  nsu?: string | null;
  authorizationCode?: string | null;
  tid?: string | null;
  transactionId?: string | null;
  orderNumber?: string | null;
  installmentNumber?: number | null;
  totalInstallments?: number | null;
};

export type RedeReceivableLike = {
  id?: string;
  transactionId?: string | null;
  nsu?: string | null;
  authorizationCode?: string | null;
  expectedPaymentDate?: Date | string | null;
  actualPaymentDate?: Date | string | null;
  grossAmount: DecimalLike;
  netAmount?: DecimalLike | null;
  installmentNumber?: number | null;
  totalInstallments?: number | null;
  status?: string | null;
};

export type ReconciliationDifference = {
  type: ReconciliationDivergenceType;
  description: string;
  expectedValue?: unknown;
  actualValue?: unknown;
  severity: DivergenceSeverity;
};

export type ReconciliationScoreResult = {
  score: number;
  matchLevel: ReconciliationMatchLevel;
  status: Extract<ReconciliationStatus, 'MATCHED_AUTOMATICALLY' | 'DIVERGENT' | 'NOT_FOUND'>;
  ruleApplied: string;
  differences: ReconciliationDifference[];
};

export type MatchCandidate = {
  transaction?: RedeTransactionLike | null;
  receivable?: RedeReceivableLike | null;
};

export type BestMatchResult = ReconciliationScoreResult & MatchCandidate;

export type RunReconciliationInput = {
  startDate: Date;
  endDate: Date;
  gatewayProvider: GatewayProvider;
};

export type RunReconciliationSummary = {
  processed: number;
  matchedAutomatically: number;
  divergent: number;
  notFound: number;
  errors: Array<{
    financialTitleId?: string;
    message: string;
  }>;
};

export type ReconciliationFilters = {
  page?: number;
  limit?: number;
  status?: ReconciliationStatus;
  matchLevel?: ReconciliationMatchLevel;
  gatewayProvider?: GatewayProvider;
  minScore?: number;
  maxScore?: number;
  startDate?: Date;
  endDate?: Date;
  financialTitleId?: string;
  redeTransactionId?: string;
  redeReceivableId?: string;
};

export type DivergenceFilters = {
  page?: number;
  limit?: number;
  divergenceType?: ReconciliationDivergenceType;
  severity?: DivergenceSeverity;
  resolved?: boolean;
  financialTitleId?: string;
  redeReceivableId?: string;
};

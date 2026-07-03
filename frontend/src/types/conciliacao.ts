import type { FinancialTitle } from './financeiro';
import type { RedeReceivable, RedeTransaction } from './rede';

export type Reconciliation = {
  id: string;
  financialTitleId?: string | null;
  redeTransactionId?: string | null;
  redeReceivableId?: string | null;
  provider: string;
  status: string;
  matchLevel: string;
  score: number;
  matchedBy?: string | null;
  matchedAt?: string | null;
  reversedAt?: string | null;
  reversalReason?: string | null;
  grossAmountDiff?: string | null;
  netAmountDiff?: string | null;
  dateDiffDays?: number | null;
  ruleApplied?: string | null;
  justification?: string | null;
  metadata?: unknown;
  createdAt: string;
  financialTitle?: FinancialTitle | null;
  redeTransaction?: RedeTransaction | null;
  redeReceivable?: RedeReceivable | null;
  divergences?: ReconciliationDivergence[];
  auditEvents?: Array<Record<string, unknown>>;
};

export type ReconciliationDivergence = {
  id: string;
  reconciliationId?: string | null;
  financialTitleId?: string | null;
  redeReceivableId?: string | null;
  divergenceType: string;
  description: string;
  expectedValue?: unknown;
  actualValue?: unknown;
  severity: string;
  resolved: boolean;
  createdAt: string;
};

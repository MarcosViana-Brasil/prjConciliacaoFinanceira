import type { FinancialTitleStatus, GatewayProvider } from '@prisma/client';

export type MoneyInput = string | number;

export type FinancialTitleFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: FinancialTitleStatus;
  customerDocument?: string;
  customerName?: string;
  titleNumber?: string;
  orderNumber?: string;
  nsu?: string;
  authorizationCode?: string;
  tid?: string;
  transactionId?: string;
  gatewayProvider?: GatewayProvider;
  dueDateStart?: Date;
  dueDateEnd?: Date;
  issueDateStart?: Date;
  issueDateEnd?: Date;
  minAmount?: MoneyInput;
  maxAmount?: MoneyInput;
  onlyDeleted?: boolean;
};

export type CreateFinancialTitleInput = {
  externalId?: string | null;
  titleNumber: string;
  customerName: string;
  customerDocument?: string | null;
  orderNumber?: string | null;
  installmentNumber?: number | null;
  totalInstallments?: number | null;
  grossAmount: MoneyInput;
  netAmountExpected?: MoneyInput | null;
  paidAmount?: MoneyInput | null;
  dueDate: Date;
  issueDate?: Date | null;
  paidAt?: Date | null;
  gatewayProvider?: GatewayProvider | null;
  gatewayReference?: string | null;
  nsu?: string | null;
  authorizationCode?: string | null;
  tid?: string | null;
  transactionId?: string | null;
  metadata?: unknown;
  justification?: string;
};

export type UpdateFinancialTitleInput = Partial<Omit<CreateFinancialTitleInput, 'titleNumber' | 'justification'>> & {
  status?: FinancialTitleStatus;
  justification?: string;
};

export type MarkFinancialTitlePaidInput = {
  paidAmount: MoneyInput;
  paidAt: Date;
  justification: string;
};

export type JustifiedFinancialTitleInput = {
  justification: string;
};

export type SoftDeleteFinancialTitleInput = {
  justification?: string;
};

export type ImportFinancialTitlesInput = {
  source: string;
  items: CreateFinancialTitleInput[];
  justification: string;
};

export type ImportFinancialTitlesResult = {
  total: number;
  created: number;
  skipped: number;
  errors: Array<{
    index: number;
    titleNumber?: string;
    externalId?: string | null;
    message: string;
  }>;
};

export type RedeTransaction = {
  id: string;
  transactionId: string;
  tid?: string | null;
  nsu?: string | null;
  authorizationCode?: string | null;
  orderNumber?: string | null;
  saleDate?: string | null;
  captureDate?: string | null;
  grossAmount: string;
  netAmount?: string | null;
  feeAmount?: string | null;
  installmentNumber?: number | null;
  totalInstallments?: number | null;
  brand?: string | null;
  paymentMethod?: string | null;
  status: string;
  createdAt: string;
};

export type RedeReceivable = {
  id: string;
  transactionId: string;
  nsu?: string | null;
  authorizationCode?: string | null;
  expectedPaymentDate?: string | null;
  actualPaymentDate?: string | null;
  grossAmount: string;
  netAmount?: string | null;
  feeAmount?: string | null;
  adjustmentAmount?: string | null;
  installmentNumber?: number | null;
  totalInstallments?: number | null;
  status: string;
  createdAt: string;
};

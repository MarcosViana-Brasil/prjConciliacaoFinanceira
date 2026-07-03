import type { FetchReceivablesParams, FetchTransactionsParams, GatewayFetchResult } from '../gateway-provider.types.js';

const transactionItems = [
  {
    transactionId: 'REDE-TX-1001',
    tid: 'TID1001',
    nsu: 'NSU1001',
    authorizationCode: 'AUTH1001',
    orderNumber: 'PED-1001',
    saleDate: '2026-07-01T10:15:00.000Z',
    captureDate: '2026-07-01T10:16:00.000Z',
    grossAmount: '100.00',
    netAmount: '96.50',
    feeAmount: '3.50',
    installmentNumber: 1,
    totalInstallments: 1,
    brand: 'VISA',
    paymentMethod: 'CREDIT',
    status: 'CAPTURED',
    establishmentCode: 'PV-001'
  },
  {
    transactionId: 'REDE-TX-1002',
    tid: 'TID1002',
    nsu: 'NSU1002',
    authorizationCode: 'AUTH1002',
    orderNumber: 'PED-1002',
    saleDate: '2026-07-02T12:00:00.000Z',
    captureDate: '2026-07-02T12:01:00.000Z',
    grossAmount: '300.00',
    netAmount: '289.50',
    feeAmount: '10.50',
    installmentNumber: 1,
    totalInstallments: 3,
    brand: 'MASTERCARD',
    paymentMethod: 'CREDIT_INSTALLMENTS',
    status: 'CAPTURED',
    establishmentCode: 'PV-001'
  },
  {
    transactionId: 'REDE-TX-1003',
    tid: 'TID1003',
    nsu: 'NSU1003',
    authorizationCode: 'AUTH1003',
    orderNumber: 'PED-1003',
    saleDate: '2026-07-03T09:30:00.000Z',
    grossAmount: '80.00',
    netAmount: '0.00',
    feeAmount: '0.00',
    installmentNumber: 1,
    totalInstallments: 1,
    brand: 'ELO',
    paymentMethod: 'DEBIT',
    status: 'CANCELED',
    establishmentCode: 'PV-001'
  }
];

const receivableItems = [
  {
    transactionId: 'REDE-TX-1001',
    nsu: 'NSU1001',
    authorizationCode: 'AUTH1001',
    expectedPaymentDate: '2026-07-31',
    actualPaymentDate: null,
    grossAmount: '100.00',
    netAmount: '96.50',
    feeAmount: '3.50',
    adjustmentAmount: '0.00',
    installmentNumber: 1,
    totalInstallments: 1,
    status: 'PENDING',
    bankCode: '341',
    agency: '0001',
    account: '12345-6'
  },
  {
    transactionId: 'REDE-TX-1002',
    nsu: 'NSU1002',
    authorizationCode: 'AUTH1002',
    expectedPaymentDate: '2026-08-01',
    actualPaymentDate: '2026-08-01',
    grossAmount: '100.00',
    netAmount: '96.50',
    feeAmount: '3.50',
    adjustmentAmount: '0.00',
    installmentNumber: 1,
    totalInstallments: 3,
    status: 'PAID',
    bankCode: '341',
    agency: '0001',
    account: '12345-6'
  },
  {
    transactionId: 'REDE-TX-1002',
    nsu: 'NSU1002',
    authorizationCode: 'AUTH1002',
    expectedPaymentDate: '2026-09-01',
    actualPaymentDate: null,
    grossAmount: '100.00',
    netAmount: '95.80',
    feeAmount: '3.50',
    adjustmentAmount: '-0.70',
    installmentNumber: 2,
    totalInstallments: 3,
    status: 'ADJUSTED',
    bankCode: '341',
    agency: '0001',
    account: '12345-6'
  },
  {
    transactionId: 'REDE-TX-1004',
    nsu: 'NSU1004',
    authorizationCode: 'AUTH1004',
    expectedPaymentDate: '2026-07-15',
    actualPaymentDate: '2026-07-10',
    grossAmount: '200.00',
    netAmount: '190.00',
    feeAmount: '7.00',
    adjustmentAmount: '-3.00',
    installmentNumber: 1,
    totalInstallments: 1,
    status: 'ANTICIPATED',
    bankCode: '341',
    agency: '0001',
    account: '12345-6'
  }
];

export function getMockTransactions(params: FetchTransactionsParams): GatewayFetchResult {
  return {
    endpoint: '/transactions',
    statusCode: 200,
    requestParams: params,
    responsePayload: {
      provider: 'REDE',
      transactions: transactionItems,
      page: params.page ?? 1,
      limit: params.limit ?? transactionItems.length
    },
    durationMs: 5
  };
}

export function getMockReceivables(params: FetchReceivablesParams): GatewayFetchResult {
  return {
    endpoint: '/receivables',
    statusCode: 200,
    requestParams: params,
    responsePayload: {
      provider: 'REDE',
      receivables: receivableItems,
      page: params.page ?? 1,
      limit: params.limit ?? receivableItems.length
    },
    durationMs: 5
  };
}

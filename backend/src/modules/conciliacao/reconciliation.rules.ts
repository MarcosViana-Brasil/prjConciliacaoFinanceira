export const RECONCILIATION_WEIGHTS = {
  transactionId: 35,
  tid: 30,
  nsu: 25,
  authorizationCode: 25,
  orderNumber: 20,
  grossAmount: 25,
  netAmount: 15,
  installmentNumber: 10,
  totalInstallments: 5,
  saleDate: 10,
  expectedPaymentDate: 10,
  gatewayProvider: 5
} as const;

export const RECONCILIATION_RULES = {
  strongNsuAuthorizationAmount: 'nsu_authorization_gross_amount',
  strongTransactionAmount: 'transaction_id_gross_amount',
  strongTidAmount: 'tid_gross_amount',
  strongOrderAmountInstallment: 'order_number_gross_amount_installment',
  mediumOrderAmount: 'order_number_gross_amount',
  mediumNetExpectedReceivable: 'net_amount_expected_receivable_payment_date',
  weakAmountDate: 'gross_amount_date_window',
  noMatch: 'no_match'
} as const;

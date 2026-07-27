import type { ItauBoletoChargeType, ItauBoletoMovementType, ItauBoletoStatus } from '@prisma/client';

export type ItauBoletoListParams = {
  idBeneficiario: string;
  seuNumero?: string;
  nossoNumero?: string;
  codigoCarteira?: string;
  codigoBarra?: string;
  situacao?: string;
  instrumentoCobranca?: string;
  dataEntrada?: string;
  dataEmissao?: string;
  dataCancelamento?: string;
  dataVencimento?: string;
  dataPagamento?: string;
  view?: string;
  page?: number;
  pageSize?: number;
};

export type ItauBoletoDetailParams = {
  idBeneficiario: string;
  codigoCarteira: string;
  nossoNumero: string;
  view?: string;
};

export type ItauFrancesaListParams = {
  agencia: string;
  conta: string;
  dac: string;
  mesReferencia?: string;
};

export type ItauBoletoMovementParams = {
  francesaId: string;
  data: string;
  tipoCobranca?: string;
  tipoMovimentacao?: string;
  nossoNumero?: string;
  seuNumero?: string;
  numeroCarteira?: string;
  nomePagador?: string;
};

export type ItauImportResult = {
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

export type ItauReconciliationResult = {
  processed: number;
  matched: number;
  divergent: number;
  notFound: number;
  skipped: number;
  errors: Array<{
    movementId?: string;
    message: string;
  }>;
};

export type NormalizedItauBoleto = {
  boletoId?: string | null;
  beneficiaryId: string;
  walletCode?: string | null;
  ourNumber: string;
  ourNumberDigit?: string | null;
  yourNumber?: string | null;
  marketIdentifier?: string | null;
  barcode?: string | null;
  digitableLine?: string | null;
  payerName?: string | null;
  payerDocument?: string | null;
  issueDate?: Date | null;
  dueDate?: Date | null;
  paymentLimitDate?: Date | null;
  amount?: string | null;
  paidAmount?: string | null;
  paymentDate?: Date | null;
  status: ItauBoletoStatus;
  chargeType: ItauBoletoChargeType;
  hasPixQrCode: boolean;
  txid?: string | null;
  pixEmv?: string | null;
  metadata: Record<string, unknown>;
};

export type NormalizedItauBoletoMovement = {
  movementDate: Date;
  titleWalletMovementDate?: Date | null;
  inclusionDate?: Date | null;
  dueDate?: Date | null;
  agency?: string | null;
  account?: string | null;
  beneficiaryAccountDigit?: string | null;
  beneficiaryId?: string | null;
  walletCode?: string | null;
  ourNumber: string;
  ourNumberDigit?: string | null;
  yourNumber?: string | null;
  titleSequence?: number | null;
  payerName?: string | null;
  receiverAgency?: string | null;
  statusCode?: string | null;
  movementType: ItauBoletoMovementType;
  chargeType: ItauBoletoChargeType;
  amount?: string | null;
  netAmount?: string | null;
  increaseAmount?: string | null;
  decreaseAmount?: string | null;
  hasCreditSplit: boolean;
  metadata: Record<string, unknown>;
};

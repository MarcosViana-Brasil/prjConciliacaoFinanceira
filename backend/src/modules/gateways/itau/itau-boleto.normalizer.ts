import {
  getArrayPayload,
  isRecord,
  mapBoletoStatus,
  mapChargeType,
  mapMovementType,
  readNestedBoolean,
  readNestedDate,
  readNestedMoney,
  readNestedNumber,
  readNestedString
} from './itau-boleto.utils.js';
import type { NormalizedItauBoleto, NormalizedItauBoletoMovement } from './itau-boleto.types.js';

export function normalizeItauBoletos(payload: unknown): NormalizedItauBoleto[] {
  const items = getArrayPayload(payload, ['boletos', 'items', 'data', 'results']);
  const normalized: NormalizedItauBoleto[] = [];

  for (const item of items) {
    const record = unwrapBoletoRecord(item);
    if (!record) continue;

    const beneficiaryId =
      readNestedString(record, ['idBeneficiario']) ?? readNestedString(record, ['beneficiario', 'id_beneficiario']);
    const ourNumber =
      readNestedString(record, ['nossoNumero']) ?? readNestedString(record, ['dado_boleto', 'dados_individuais_boleto', 'numero_nosso_numero']);

    if (!beneficiaryId || !ourNumber) continue;

    const detail = isRecord(record.dado_boleto) && isRecord(record.dado_boleto.dados_individuais_boleto)
      ? record.dado_boleto.dados_individuais_boleto
      : {};
    const payments = isRecord(record.dado_boleto) && isRecord(record.dado_boleto.pagamentos_cobranca)
      ? record.dado_boleto.pagamentos_cobranca
      : {};
    const qrCode = isRecord(record.dadosQrcode) ? record.dadosQrcode : isRecord(record.qrcode_pix) ? record.qrcode_pix : {};

    normalized.push({
      boletoId: readNestedString(record, ['idBoleto']) ?? readNestedString(record, ['id_boleto']),
      beneficiaryId,
      walletCode: readNestedString(record, ['codigoCarteira']) ?? readNestedString(record, ['dado_boleto', 'codigo_carteira']),
      ourNumber,
      ourNumberDigit: readNestedString(record, ['dacTitulo']),
      yourNumber: readNestedString(record, ['seuNumero']) ?? readNestedString(detail, ['texto_seu_numero']),
      marketIdentifier: readNestedString(record, ['identificadorBoletoMercado']) ?? readNestedString(detail, ['identificador_boleto_mercado']),
      barcode: readNestedString(record, ['codigoBarra']) ?? readNestedString(detail, ['codigo_barras']),
      digitableLine: readNestedString(record, ['numeroLinhaDigitavel']) ?? readNestedString(detail, ['numero_linha_digitavel']),
      payerName: readNestedString(record, ['pagador', 'nomePagador']),
      payerDocument: readNestedString(record, ['pagador', 'numeroDocumento']),
      issueDate: readNestedDate(record, ['dataEmissao']),
      dueDate: readNestedDate(record, ['dataVencimento']) ?? readNestedDate(detail, ['data_vencimento']),
      paymentLimitDate: readNestedDate(record, ['dataLimitePagamento']),
      amount: readNestedMoney(record, ['valor']) ?? readNestedMoney(detail, ['valor_titulo']),
      paidAmount: readNestedMoney(record, ['valorPagoTotal']) ?? readNestedMoney(payments, ['valor_pago_total_cobranca']),
      paymentDate: readNestedDate(record, ['dataPagamento']) ?? readNestedDate(payments, ['data_inclusao_pagamento']),
      status: mapBoletoStatus(readNestedString(record, ['situacao']) ?? readNestedString(detail, ['situacao_geral_boleto'])),
      chargeType: mapChargeType(readNestedString(record, ['instrumentoCobranca']) ?? readNestedString(payments, ['descricao_meio_pagamento'])),
      hasPixQrCode: Boolean(Object.keys(qrCode).length),
      txid: readNestedString(qrCode, ['txid']),
      pixEmv: readNestedString(qrCode, ['emv']) ?? readNestedString(qrCode, ['emv_payload']),
      metadata: { raw: record }
    });
  }

  return normalized;
}

export function normalizeItauBoletoMovements(payload: unknown): NormalizedItauBoletoMovement[] {
  const items = getArrayPayload(payload, ['movimentacoes', 'items', 'data', 'results']);
  const normalized: NormalizedItauBoletoMovement[] = [];

  for (const item of items) {
    if (!isRecord(item)) continue;

    const movementDate = readNestedDate(item, ['dataMovimentacao']) ?? readNestedDate(item, ['data']);
    const ourNumber = readNestedString(item, ['nossoNumero']) ?? readNestedString(item, ['numero_nosso_numero']);

    if (!movementDate || !ourNumber) continue;

    normalized.push({
      movementDate,
      titleWalletMovementDate: readNestedDate(item, ['dataMovimentacaoTituloCarteira']),
      inclusionDate: readNestedDate(item, ['dataInclusao']),
      dueDate: readNestedDate(item, ['dataVencimento']),
      agency: readNestedString(item, ['agencia']),
      account: readNestedString(item, ['conta']),
      beneficiaryAccountDigit: readNestedString(item, ['dac']),
      beneficiaryId: readNestedString(item, ['idBeneficiario']),
      walletCode: readNestedString(item, ['numeroCarteira']) ?? readNestedString(item, ['codigoCarteira']),
      ourNumber,
      ourNumberDigit: readNestedString(item, ['dacTitulo']),
      yourNumber: readNestedString(item, ['seuNumero']),
      titleSequence: readNestedNumber(item, ['sequenciaTitulo']),
      payerName: readNestedString(item, ['pagador']) ?? readNestedString(item, ['nomePagador']),
      receiverAgency: readNestedString(item, ['agenciaRecebedora']),
      statusCode: readNestedString(item, ['codigoStatus']),
      movementType: mapMovementType(readNestedString(item, ['tipoMovimentacao'])),
      chargeType: mapChargeType(readNestedString(item, ['tipoCobranca'])),
      amount: readNestedMoney(item, ['valorTitulo']),
      netAmount: readNestedMoney(item, ['valorLiquidoLancado']),
      increaseAmount: readNestedMoney(item, ['valorAcrescimo']),
      decreaseAmount: readNestedMoney(item, ['valorDecrescimo']),
      hasCreditSplit: readNestedBoolean(item, ['indicadorRateioCredito']),
      metadata: { raw: item }
    });
  }

  return normalized;
}

function unwrapBoletoRecord(item: unknown) {
  if (!isRecord(item)) return null;
  if (isRecord(item.data)) return item.data;
  return item;
}

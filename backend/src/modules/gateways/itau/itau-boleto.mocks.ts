import type { GatewayFetchResult } from '../gateway-provider.types.js';
import type { ItauBoletoDetailParams, ItauBoletoListParams, ItauBoletoMovementParams, ItauFrancesaListParams } from './itau-boleto.types.js';

const boletoItems = [
  {
    idBoleto: 'ITAU-BOL-1001',
    idBeneficiario: '123456789',
    codigoCarteira: '109',
    nossoNumero: '0000001001',
    seuNumero: 'TIT-1001',
    identificadorBoletoMercado: 'MERC-1001',
    codigoBarra: '34191090000000150000000001001000000000000000',
    numeroLinhaDigitavel: '34191.09008 00000.100103 00000.000000 1 00000000015000',
    pagador: { nomePagador: 'Cliente Exemplo', numeroDocumento: '12345678000190' },
    dataEmissao: '2026-07-01',
    dataVencimento: '2026-07-20',
    dataLimitePagamento: '2026-07-25',
    valor: '150.00',
    valorPagoTotal: '150.00',
    dataPagamento: '2026-07-19',
    situacao: 'pago',
    instrumentoCobranca: 'boleto'
  },
  {
    idBoleto: 'ITAU-BOL-1002',
    idBeneficiario: '123456789',
    codigoCarteira: '109',
    nossoNumero: '0000001002',
    seuNumero: 'TIT-1002',
    pagador: { nomePagador: 'Cliente Bolecode', numeroDocumento: '98765432000110' },
    dataEmissao: '2026-07-03',
    dataVencimento: '2026-07-28',
    valor: '320.50',
    situacao: 'aberto',
    instrumentoCobranca: 'bolecode',
    dadosQrcode: { txid: 'TXID1002', emv: '000201010212...' }
  }
];

const movementItems = [
  {
    agencia: '1500',
    conta: '12345',
    dac: '6',
    dataMovimentacao: '2026-07-19',
    numeroCarteira: '109',
    codigoStatus: 'LIQ',
    tipoMovimentacao: 'liquidacoes',
    nossoNumero: '0000001001',
    seuNumero: 'TIT-1001',
    dacTitulo: '1',
    tipoCobranca: 'boleto',
    sequenciaTitulo: 1,
    pagador: 'Cliente Exemplo',
    agenciaRecebedora: '1500',
    dataMovimentacaoTituloCarteira: '2026-07-19',
    dataInclusao: '2026-07-19',
    dataVencimento: '2026-07-20',
    valorTitulo: '150.00',
    valorLiquidoLancado: '148.90',
    valorAcrescimo: '0.00',
    valorDecrescimo: '1.10',
    indicadorRateioCredito: false
  }
];

export function getMockBoletos(params: ItauBoletoListParams): GatewayFetchResult {
  return {
    endpoint: '/boletos',
    statusCode: 200,
    requestParams: params,
    responsePayload: {
      data: boletoItems,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? boletoItems.length
    },
    durationMs: 5
  };
}

export function getMockBoletoDetail(params: ItauBoletoDetailParams): GatewayFetchResult {
  const boleto = boletoItems.find((item) => item.nossoNumero === params.nossoNumero) ?? boletoItems[0];

  return {
    endpoint: '/boletos',
    statusCode: 200,
    requestParams: params,
    responsePayload: {
      data: {
        id_boleto: boleto.idBoleto,
        beneficiario: { id_beneficiario: params.idBeneficiario },
        dado_boleto: {
          codigo_carteira: params.codigoCarteira,
          dados_individuais_boleto: {
            numero_nosso_numero: boleto.nossoNumero,
            texto_seu_numero: boleto.seuNumero,
            situacao_geral_boleto: boleto.situacao,
            data_vencimento: boleto.dataVencimento,
            valor_titulo: boleto.valor,
            codigo_barras: boleto.codigoBarra,
            numero_linha_digitavel: boleto.numeroLinhaDigitavel,
            identificador_boleto_mercado: boleto.identificadorBoletoMercado
          },
          pagamentos_cobranca: {
            data_inclusao_pagamento: boleto.dataPagamento,
            valor_pago_total_cobranca: boleto.valorPagoTotal,
            descricao_meio_pagamento: 'boleto',
            descricao_canal_pagamento: 'internet banking',
            codigo_instituicao_financeira_pagamento: '341',
            numero_agencia_recebedora: '1500'
          }
        }
      }
    },
    durationMs: 5
  };
}

export function getMockFrancesas(params: ItauFrancesaListParams): GatewayFetchResult {
  return {
    endpoint: '/francesas',
    statusCode: 200,
    requestParams: params,
    responsePayload: {
      data: [{ id: 'francesa-mock-001', agencia: params.agencia, conta: params.conta, dac: params.dac, mesReferencia: params.mesReferencia }]
    },
    durationMs: 5
  };
}

export function getMockMovements(params: ItauBoletoMovementParams): GatewayFetchResult {
  return {
    endpoint: `/francesas/${params.francesaId}/movimentacoes`,
    statusCode: 200,
    requestParams: params,
    responsePayload: { data: movementItems },
    durationMs: 5
  };
}

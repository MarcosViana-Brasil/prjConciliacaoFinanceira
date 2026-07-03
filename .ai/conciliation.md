# FIP Core MVP — Conciliation

## Objetivo
Implementar motor de conciliação entre títulos internos e recebíveis da Rede.

## Entradas

- Títulos financeiros internos
- Transações Rede
- Recebíveis Rede
- Parcelas
- Taxas
- Ajustes

## Critérios de matching

### Match forte
- NSU + autorização + valor
- transactionId + valor
- pedido interno + valor + parcela

### Match médio
- valor + data da venda + parcela
- valor líquido + data de crédito
- cliente + valor + período

### Match fraco
- valor aproximado + data aproximada
- parcela + bandeira + estabelecimento

## Score

Sugestão:

- 90 a 100: conciliação automática
- 70 a 89: sugestão para revisão
- 40 a 69: divergência
- 0 a 39: não encontrado

## Status

- PENDENTE
- CONCILIADO_AUTOMATICO
- CONCILIADO_MANUAL
- DIVERGENTE
- NAO_ENCONTRADO
- DUPLICADO
- CANCELADO
- ESTORNADO
- REPROCESSADO
- ERRO

## Regras

- Não conciliar automaticamente abaixo do score mínimo.
- Registrar regra aplicada.
- Registrar score.
- Registrar diferenças encontradas.
- Toda conciliação manual exige justificativa.
- Toda reversão exige justificativa.
- Manter histórico de tentativas.

# FIP Core MVP — Database

## Banco obrigatório
PostgreSQL.

## ORM
Prisma.

## Princípios

- Usar UUID como chave primária.
- Usar JSONB para metadata e payloads.
- Criar índices para campos de busca e conciliação.
- Nunca apagar dados críticos fisicamente.
- Registrar histórico e auditoria.

## Tabelas mínimas

### users
Usuários do sistema.

### roles
Perfis de acesso.

### financial_titles
Títulos financeiros internos.

### gateway_integrations
Configurações dos gateways.

### raw_payloads
Payloads brutos recebidos da Rede ou futuros gateways.

### rede_transactions
Transações normalizadas da Rede.

### rede_receivables
Recebíveis normalizados da Rede.

### reconciliations
Resultado da conciliação.

### reconciliation_divergences
Divergências identificadas.

### audit_events
Eventos de auditoria.

### job_executions
Histórico de jobs.

### api_logs
Logs de chamadas externas e internas relevantes.

## Campos padrão

Campos recomendados para tabelas críticas:

- id UUID
- createdAt
- updatedAt
- deletedAt opcional
- status
- metadata JSONB
- createdBy
- updatedBy

## Índices recomendados

- NSU
- código de autorização
- transactionId
- valor
- data da venda
- data de crédito
- status
- hash do payload
- entidade auditada
- createdAt

## Idempotência

Toda importação externa deve calcular hash do payload ou chave externa única para evitar duplicidade.

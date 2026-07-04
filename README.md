# FIP Core MVP

Fundacao tecnica do FIP Core MVP, uma aplicacao de conciliacao financeira preparada inicialmente para o Gateway Rede/Itau e desenhada para receber novos gateways no futuro.

## Stack

- Backend: Node.js, TypeScript, Fastify, Prisma, Zod, Pino
- Frontend: Next.js, React, TypeScript, TailwindCSS
- Banco: PostgreSQL
- Infra local: Docker Compose, PgAdmin
- Jobs: node-cron, runner interno e historico em PostgreSQL

## Status dos Prompts Implementados

Este repositorio ja contempla os incrementos principais do MVP FIP Core:

- Fundacao tecnica: monorepo com `backend/`, `frontend/`, Docker Compose, PostgreSQL, PgAdmin, Prisma, scripts de subida e documentacao base.
- Backend modular: Fastify com envelope padrao de resposta, tratamento centralizado de erros, validacoes Zod, logger Pino, Prisma singleton e separacao controller/service/repository.
- Usuarios e perfis: cadastro, listagem, atualizacao, soft delete, perfis `ADMIN`, `FINANCEIRO`, `AUDITOR` e `SOMENTE_LEITURA`.
- Auditoria e rastreabilidade: `audit_events`, logs tecnicos, payloads brutos, hashes, mascaramento de dados sensiveis e justificativas em acoes criticas.
- Financeiro interno: CRUD/importacao de titulos financeiros, status, filtros, soft delete, baixa manual, cancelamento e restauracao.
- Gateway Rede: cliente configuravel, mocks controlados, importacao de transacoes e recebiveis, persistencia de payload bruto, normalizacao e upsert idempotente.
- Conciliacao: motor de score, matching automatico, divergencias, revisao manual, rejeicao e reversao auditada.
- Painel frontend: dashboard, titulos, Rede, conciliacao, divergencias, auditoria, payloads, jobs e configuracoes.
- Jobs e reprocessamento: scheduler, runner generico, lock simples, jobs manuais/agendados, reprocessamento de payload, job history e integracao com o painel.
- Dados demo: seed idempotente para popular o painel com titulos, transacoes, recebiveis, conciliacoes, divergencia, payloads, job e auditoria.
- Autenticacao e acesso: login com token Bearer, sessao no frontend, guard de rotas e controle basico por perfis.
- Seguranca de dependencias: revisao de `npm audit` no backend/frontend, upgrades pontuais sem `npm audit fix --force` e lockfiles atualizados.

## Pre-requisitos

- Docker e Docker Compose
- Node.js 20+ para rodar fora do Docker
- npm

## Subir com Docker

Crie seu arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Depois suba todos os servicos:

```bash
docker compose up -d
```

Ou use o script de subida completa no Windows:

```powershell
.\scripts\start-system.ps1
```

Atalhos uteis:

```powershell
.\scripts\start-system.ps1 -SkipSeed
.\scripts\start-system.ps1 -NoBuild
```

O script cria `.env` se estiver ausente, sobe Postgres/PgAdmin, aplica migrations, executa seed inicial e deixa backend/frontend disponiveis.

Se voce adicionou novas variaveis no `docker-compose.yml`, recrie o servico afetado para o Docker receber o novo environment:

```bash
docker compose up -d backend frontend
```

## Acessos

- Frontend: http://localhost:3100
- Backend health check: http://localhost:3101/health
- PgAdmin: http://localhost:5050
- PostgreSQL: localhost:15433

No PgAdmin, cadastre um servidor apontando para o host `postgres`, porta `5432`, usuario e senha configurados no `.env`. Para conexoes pelo host local, use `localhost:15433`.

## Painel Frontend MVP

O painel Next.js fica em `frontend/` e entrega as telas iniciais do fluxo financeiro:

- `/dashboard` com indicadores operacionais.
- `/titulos`, `/titulos/novo` e `/titulos/[id]` para consulta e cadastro manual de titulos.
- `/rede/transacoes` e `/rede/recebiveis` para dados normalizados da Rede e importacao mockada/controlada.
- `/conciliacao`, `/conciliacao/[id]` e `/divergencias` para execucao, revisao e decisao manual de conciliacoes.
- `/auditoria`, `/payloads`, `/jobs` e `/configuracoes` para rastreabilidade e operacao.
- `/jobs` permite disparar importacao Rede e conciliacao.
- `/payloads` permite visualizar JSON bruto e solicitar reprocessamento com justificativa.

Ao rodar fora do Docker, configure `frontend/.env.local` com `NEXT_PUBLIC_API_URL=http://localhost:3001`. Pelo Compose, use a variavel raiz `NEXT_PUBLIC_API_URL=http://localhost:3101`.

## Prisma

Dentro do container do backend:

```bash
docker compose exec backend npm run prisma:generate
docker compose exec backend npm run prisma:migrate -- --name initial_schema
docker compose exec backend npm run prisma:seed
docker compose exec backend npm run prisma:studio
```

Para criar migrations versionadas em desenvolvimento local:

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate -- --name initial_schema
npm run prisma:seed
```

Antes de executar o seed, configure no `.env` do backend ou no `.env` raiz:

```bash
ADMIN_NAME=FIP Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=troque_esta_senha
AUTH_JWT_SECRET=troque_por_um_segredo_com_32_caracteres_ou_mais
```

O seed cria os perfis `ADMIN`, `FINANCEIRO`, `AUDITOR` e `SOMENTE_LEITURA`, alem do usuario administrador inicial. A senha nao fica hardcoded no codigo.

O seed tambem inclui uma carga demo idempotente para visualizacao do painel: titulos financeiros, transacoes e recebiveis Rede, payloads brutos, conciliacoes, divergencia, job e evento de auditoria. Para recarregar esses dados no ambiente Docker:

```bash
docker compose exec backend npm run prisma:seed
```

Por ser idempotente, o comando pode ser executado novamente sem duplicar a carga demo principal.

## Rodar fora do Docker

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Frontend:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## Validacao

Backend:

```bash
cd backend
npm run lint
npm test
```

Frontend:

```bash
cd frontend
npm run build
npm run lint
```

Observacao: o build do frontend executa type-check e compilacao. O lint usa ESLint 9 com `eslint-config-next` em `frontend/eslint.config.mjs`.

## Seguranca de Dependencias

A revisao de vulnerabilidades foi feita com `npm audit` em `backend/` e `frontend/`, sem uso de `npm audit fix --force`.

Atualizacoes aplicadas:

- Backend: `fastify@5.9.0`, `@fastify/cors@11.2.0` e `node-cron@4.5.0`.
- Frontend: `next@16.2.10`, `eslint@9.39.2`, `eslint-config-next@16.2.10` e `postcss@8.5.10`.
- Frontend: `overrides.next.postcss` fixa o `postcss` transiente do Next em `8.5.10`, porque o pacote ainda declara uma versao vulneravel no grafo padrao.

Comandos de conferencia:

```bash
cd backend
npm audit
npm run lint
npm test

cd ../frontend
npm audit
npm run lint
npm run build
```

## Rotas Backend MVP

Todas as respostas seguem o envelope padrao `{ success, data, message }` ou `{ success: false, error }`. Rotas paginadas aceitam `page` e `limit` com limite maximo de 100.

Autenticacao:

- `POST /api/auth/login` - autentica usuario ativo por e-mail e senha e retorna token.
- `GET /api/auth/me` - retorna usuario autenticado.
- Rotas `/api/*`, exceto login, exigem `Authorization: Bearer <token>`.
- Auditoria usa o usuario autenticado quando o token e valido.

- `GET /health` - health check do backend.
- `GET /api/users` - lista usuarios com `search` e `status`.
- `GET /api/users/:id` - busca usuario por ID.
- `POST /api/users` - cria usuario, hasheia senha e registra auditoria.
- `PUT /api/users/:id` - atualiza usuario e registra before/after.
- `DELETE /api/users/:id` - soft delete de usuario.
- `GET /api/financial-titles` - lista titulos financeiros com filtros, busca e paginacao.
- `GET /api/financial-titles/:id` - busca titulo financeiro com dados de conciliacao futura e auditoria resumida.
- `POST /api/financial-titles` - cria titulo financeiro com validacoes monetarias e auditoria.
- `PUT /api/financial-titles/:id` - atualiza titulo financeiro e registra before/after.
- `PATCH /api/financial-titles/:id/cancel` - cancela titulo financeiro com justificativa.
- `PATCH /api/financial-titles/:id/mark-paid` - registra baixa manual com justificativa.
- `PATCH /api/financial-titles/:id/restore` - restaura titulo excluido logicamente.
- `DELETE /api/financial-titles/:id` - soft delete de titulo financeiro.
- `POST /api/financial-titles/import` - importa titulos em lote com idempotencia por `externalId` ou `titleNumber`.
- `POST /api/gateways/rede/import-transactions` - importa transacoes Rede, salva payload bruto, log tecnico e normaliza dados.
- `POST /api/gateways/rede/import-receivables` - importa recebiveis Rede, salva payload bruto, log tecnico e normaliza dados.
- `GET /api/gateways/rede/transactions` - lista transacoes Rede com filtros e paginacao.
- `GET /api/gateways/rede/transactions/:id` - busca transacao Rede por ID.
- `GET /api/gateways/rede/receivables` - lista recebiveis Rede com filtros e paginacao.
- `GET /api/gateways/rede/receivables/:id` - busca recebivel Rede por ID.
- `POST /api/reconciliation/run` - executa o motor inicial de conciliacao automatica.
- `GET /api/reconciliation` - lista conciliacoes com filtros por status, score, periodo e entidades vinculadas.
- `GET /api/reconciliation/:id` - busca conciliacao com titulo, transacao, recebivel, divergencias e auditoria resumida.
- `GET /api/reconciliation/divergences` - lista divergencias com filtros.
- `POST /api/reconciliation/:id/approve-manual` - aprova conciliacao manual com justificativa.
- `POST /api/reconciliation/:id/reject` - rejeita sugestao de conciliacao com justificativa.
- `POST /api/reconciliation/:id/reverse` - reverte conciliacao com motivo auditado.
- `GET /api/audit-events` - lista auditoria com filtros por entidade, acao, usuario e periodo.
- `GET /api/audit-events/:entity/:entityId` - lista auditoria de uma entidade.
- `GET /api/payloads` - lista payloads brutos com filtros por provider, status, endpoint e periodo.
- `GET /api/payloads/:id` - busca payload bruto por ID.
- `POST /api/payloads` - salva payload bruto com hash idempotente, auditoria e log tecnico mascarado.
- `PATCH /api/payloads/:id/status` - atualiza status de processamento e registra auditoria.
- `GET /api/api-logs` - lista logs tecnicos com filtros por provider, direcao, endpoint, status e periodo.
- `GET /api/jobs` - lista execucoes de jobs.
- `GET /api/jobs/:id` - busca uma execucao de job por ID.
- `POST /api/jobs/import-rede-transactions/run` - executa manualmente o job de importacao de transacoes Rede.
- `POST /api/jobs/import-rede-receivables/run` - executa manualmente o job de importacao de recebiveis Rede.
- `POST /api/jobs/reconciliation/run` - executa manualmente o job de conciliacao automatica.
- `POST /api/jobs/reprocess-payload/:rawPayloadId` - reprocessa payload bruto com justificativa obrigatoria.
- `GET /api/settings` - lista configuracoes sem expor valores sensiveis, restrita a `ADMIN`.
- `PUT /api/settings/:key` - cria ou atualiza configuracao e registra auditoria, restrita a `ADMIN`.

Perfis atuais:

- `ADMIN`: acesso total e administracao de usuarios/configuracoes.
- `FINANCEIRO`: operacao financeira, importacoes, conciliacao, jobs e reprocessamento.
- `AUDITOR`: consultas de auditoria, payloads, jobs e dados financeiros em modo leitura.
- `SOMENTE_LEITURA`: consultas operacionais basicas.

Exemplo de login:

```json
{
  "email": "admin@example.com",
  "password": "change_me"
}
```

Use os valores definidos em `ADMIN_EMAIL` e `ADMIN_PASSWORD` no seed do ambiente.

Exemplo de criacao de titulo financeiro:

```json
{
  "externalId": "ERP-123",
  "titleNumber": "TIT-000123",
  "customerName": "Cliente Exemplo LTDA",
  "customerDocument": "12.345.678/0001-99",
  "orderNumber": "PED-123",
  "installmentNumber": 1,
  "totalInstallments": 3,
  "grossAmount": "100.00",
  "netAmountExpected": "96.50",
  "paidAmount": "0.00",
  "dueDate": "2026-07-10",
  "issueDate": "2026-07-01",
  "gatewayProvider": "REDE",
  "metadata": {
    "source": "manual"
  },
  "justification": "Cadastro inicial do titulo"
}
```

Exemplo de importacao em lote:

```json
{
  "source": "ERP",
  "items": [
    {
      "externalId": "ERP-123",
      "titleNumber": "TIT-000123",
      "customerName": "Cliente Exemplo LTDA",
      "grossAmount": "100.00",
      "dueDate": "2026-07-10"
    }
  ],
  "justification": "Importacao inicial de titulos do ERP"
}
```

Exemplo de importacao mockada da Rede:

```json
{
  "startDate": "2026-07-01",
  "endDate": "2026-07-03"
}
```

Por padrao, o modulo Rede usa mocks controlados (`REDE_USE_MOCKS=true`). Para usar endpoints reais ou homologacao contratada, configure `REDE_BASE_URL`, `REDE_TRANSACTIONS_ENDPOINT`, `REDE_RECEIVABLES_ENDPOINT`, `REDE_CLIENT_ID`, `REDE_CLIENT_SECRET`, `REDE_MERCHANT_ID` e `REDE_PV` nos arquivos `.env`, sem versionar segredos.

Exemplo de execucao da conciliacao:

```json
{
  "startDate": "2026-07-01",
  "endDate": "2026-07-03",
  "gatewayProvider": "REDE"
}
```

O motor inicial calcula score de 0 a 100, classifica o match como forte, medio, fraco ou inexistente, gera divergencias quando necessario e atualiza titulos para `RECONCILED` apenas quando a conciliacao automatica e segura.

## Jobs e Scheduler

O backend possui um runner generico de jobs com lock simples por `jobName`: se uma execucao estiver `RUNNING`, uma nova chamada manual ou agendada recebe erro `JOB_ALREADY_RUNNING`.

Jobs disponiveis no MVP:

- `IMPORT_REDE_TRANSACTIONS`
- `IMPORT_REDE_RECEIVABLES`
- `RUN_RECONCILIATION`
- `REPROCESS_PAYLOAD`
- `CLEANUP_OLD_LOGS` como placeholder seguro, sem exclusao fisica

Variaveis principais:

```env
JOBS_ENABLED=true
JOB_IMPORT_REDE_TRANSACTIONS_ENABLED=true
JOB_IMPORT_REDE_TRANSACTIONS_CRON=0 6 * * *
JOB_IMPORT_REDE_RECEIVABLES_ENABLED=true
JOB_IMPORT_REDE_RECEIVABLES_CRON=30 6 * * *
JOB_RECONCILIATION_ENABLED=true
JOB_RECONCILIATION_CRON=0 7 * * *
JOB_DEFAULT_LOOKBACK_DAYS=3
JOB_CLEANUP_OLD_LOGS_ENABLED=false
JOB_LOG_RETENTION_DAYS=90
```

Execucao manual:

```bash
curl -X POST http://localhost:3101/api/jobs/import-rede-transactions/run \
  -H "Content-Type: application/json" \
  -d "{\"startDate\":\"2026-07-01\",\"endDate\":\"2026-07-03\"}"

curl -X POST http://localhost:3101/api/jobs/import-rede-receivables/run \
  -H "Content-Type: application/json" \
  -d "{\"startDate\":\"2026-07-01\",\"endDate\":\"2026-07-03\"}"

curl -X POST http://localhost:3101/api/jobs/reconciliation/run \
  -H "Content-Type: application/json" \
  -d "{\"startDate\":\"2026-07-01\",\"endDate\":\"2026-07-03\",\"gatewayProvider\":\"REDE\"}"
```

Reprocessamento de payload bruto:

```bash
curl -X POST http://localhost:3101/api/jobs/reprocess-payload/{rawPayloadId} \
  -H "Content-Type: application/json" \
  -d "{\"justification\":\"Reprocessamento solicitado apos ajuste no normalizador.\"}"
```

O scheduler nao inicia em `NODE_ENV=test`. No ambiente Docker, os jobs agendados sao habilitados pelas variaveis `JOBS_ENABLED` e `JOB_*_ENABLED`.

## Estrutura Principal

```text
backend/src/modules/
├── users
├── financeiro
├── gateways/rede
├── conciliacao
├── auditoria
├── payloads
├── api-logs
├── jobs
└── settings

frontend/src/app/
├── dashboard
├── titulos
├── rede
├── conciliacao
├── divergencias
├── auditoria
├── payloads
├── jobs
└── configuracoes
```

## Proximos passos

1. Criar relatorios e exportacao Excel.
2. Ampliar testes de integracao/e2e cobrindo APIs, auth, jobs e fluxos do painel.
3. Evoluir scheduler para BullMQ/Redis quando o MVP exigir fila distribuida.
4. Adicionar template documentado para novos gateways alem da Rede.
5. Refinar permissoes granulares por acao e tela conforme regras de negocio reais.

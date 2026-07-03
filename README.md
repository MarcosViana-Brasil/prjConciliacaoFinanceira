# FIP Core MVP

Fundacao tecnica do FIP Core MVP, uma aplicacao de conciliacao financeira preparada inicialmente para o Gateway Rede/Itau e desenhada para receber novos gateways no futuro.

## Stack

- Backend: Node.js, TypeScript, Fastify, Prisma, Zod, Pino
- Frontend: Next.js, React, TypeScript, TailwindCSS
- Banco: PostgreSQL
- Infra local: Docker Compose, PgAdmin

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

## Acessos

- Frontend: http://localhost:3100
- Backend health check: http://localhost:3101/health
- PgAdmin: http://localhost:5050
- PostgreSQL: localhost:15433

No PgAdmin, cadastre um servidor apontando para o host `postgres`, porta `5432`, usuario e senha configurados no `.env`. Para conexoes pelo host local, use `localhost:15433`.

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
```

O seed cria os perfis `ADMIN`, `FINANCEIRO`, `AUDITOR` e `SOMENTE_LEITURA`, alem do usuario administrador inicial. A senha nao fica hardcoded no codigo.

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

## Rotas Backend MVP

Todas as respostas seguem o envelope padrao `{ success, data, message }` ou `{ success: false, error }`. Rotas paginadas aceitam `page` e `limit` com limite maximo de 100.

- `GET /health` - health check do backend.
- `GET /api/users` - lista usuarios com `search` e `status`.
- `GET /api/users/:id` - busca usuario por ID.
- `POST /api/users` - cria usuario, hasheia senha e registra auditoria.
- `PUT /api/users/:id` - atualiza usuario e registra before/after.
- `DELETE /api/users/:id` - soft delete de usuario.
- `GET /api/audit-events` - lista auditoria com filtros por entidade, acao, usuario e periodo.
- `GET /api/audit-events/:entity/:entityId` - lista auditoria de uma entidade.
- `GET /api/payloads` - lista payloads brutos com filtros por provider, status, endpoint e periodo.
- `GET /api/payloads/:id` - busca payload bruto por ID.
- `POST /api/payloads` - salva payload bruto com hash idempotente, auditoria e log tecnico mascarado.
- `PATCH /api/payloads/:id/status` - atualiza status de processamento e registra auditoria.
- `GET /api/api-logs` - lista logs tecnicos com filtros por provider, direcao, endpoint, status e periodo.
- `GET /api/jobs` - lista execucoes de jobs.
- `GET /api/settings` - lista configuracoes sem expor valores sensiveis.
- `PUT /api/settings/:key` - cria ou atualiza configuracao e registra auditoria.

Enquanto a autenticacao completa nao existe, as acoes auditadas aceitam o header temporario `x-user-id`. Sem esse header, a auditoria e registrada como operacao de sistema.

## Proximos passos

1. Criar autenticacao basica e perfis de acesso.
2. Implementar cadastro e importacao de titulos financeiros.
3. Criar contrato comum para gateways.
4. Implementar mocks e persistencia de payloads brutos da Rede.
5. Evoluir o motor de conciliacao com score, auditoria e divergencias.

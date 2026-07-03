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
docker compose exec backend npx prisma db push
docker compose exec backend npx prisma studio
```

Para criar migrations versionadas em desenvolvimento local:

```bash
cd backend
npm install
npx prisma migrate dev --name initial_schema
```

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

## Proximos passos

1. Criar autenticacao basica e perfis de acesso.
2. Implementar cadastro e importacao de titulos financeiros.
3. Criar contrato comum para gateways.
4. Implementar mocks e persistencia de payloads brutos da Rede.
5. Evoluir o motor de conciliacao com score, auditoria e divergencias.

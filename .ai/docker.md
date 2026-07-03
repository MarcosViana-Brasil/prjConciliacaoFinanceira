# FIP Core MVP — Docker

## Objetivo
Padronizar o ambiente de desenvolvimento, homologação e produção inicial com Docker.

## Containers mínimos

- frontend
- backend
- postgres
- pgadmin
- redis opcional

## docker-compose esperado

Serviços:

```text
frontend
backend
postgres
pgadmin
redis
```

## PostgreSQL

- Expor porta 5432 apenas em desenvolvimento.
- Usar volume persistente.
- Configurar usuário, senha e database via `.env`.

## Backend

- Deve depender do PostgreSQL.
- Deve executar migrations Prisma.
- Deve expor porta configurável.

## Frontend

- Deve apontar para a API backend via variável de ambiente.

## PgAdmin

Usado apenas para desenvolvimento e suporte técnico.

## Ambientes

Criar arquivos:

```text
.env.example
.env.development
.env.production.example
```

## Regras

- Nunca versionar `.env` real.
- Nunca gravar segredo em imagem Docker.
- Usar Docker Compose para subir o MVP localmente.
- O projeto deve iniciar com um único comando:

```bash
docker compose up -d
```

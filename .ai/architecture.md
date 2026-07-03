# FIP Core MVP — Architecture

## Visão geral
O FIP Core MVP será um monólito modular com frontend, backend, banco PostgreSQL e serviços auxiliares em Docker.

## Stack principal

- Node.js
- TypeScript
- Next.js
- React
- PostgreSQL
- Prisma ORM
- Docker
- Docker Compose
- Redis opcional para jobs simples
- TailwindCSS
- Zod
- Pino ou Winston
- ExcelJS

## Estilo arquitetural

Usar monólito modular com separação clara por domínio.

Estrutura sugerida:

```text
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── financeiro/
│   ├── gateways/
│   │   └── rede/
│   ├── conciliacao/
│   ├── auditoria/
│   ├── jobs/
│   └── shared/
```

## Princípios

- Clean Architecture simplificada
- Services para regras de negócio
- Repositories para acesso ao banco
- DTOs para entrada e saída
- Zod para validação
- Controllers/API Routes finos
- Auditoria centralizada
- Logs estruturados

## Fluxo macro

```text
Títulos internos
    ↓
Consulta API Rede
    ↓
Payload bruto salvo
    ↓
Normalização
    ↓
Motor de conciliação
    ↓
Conciliação automática ou divergência
    ↓
Painel administrativo
    ↓
Auditoria
```

## Preparação para novos gateways
O módulo `gateways` deve permitir adicionar novos provedores no futuro:

```text
gateways/
├── rede/
├── stone/
├── cielo/
└── mercado-pago/
```

Cada gateway deve implementar uma interface comum.

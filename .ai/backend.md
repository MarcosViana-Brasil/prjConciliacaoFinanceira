# FIP Core MVP — Backend

## Objetivo
Implementar o backend em Node.js com TypeScript, priorizando simplicidade, rastreabilidade e modularidade.

## Regras

- Usar TypeScript.
- Evitar `any`.
- Usar Prisma para banco.
- Usar Zod para validações.
- Não acessar Prisma diretamente em controllers.
- Controllers devem chamar services.
- Services devem chamar repositories.
- Toda ação crítica deve chamar o serviço de auditoria.
- Toda integração externa deve registrar log técnico.

## Estrutura sugerida

```text
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── financeiro/
│   │   ├── gateways/rede/
│   │   ├── conciliacao/
│   │   ├── auditoria/
│   │   └── jobs/
│   ├── shared/
│   │   ├── database/
│   │   ├── errors/
│   │   ├── logger/
│   │   ├── middlewares/
│   │   └── utils/
│   └── server.ts
```

## Módulos obrigatórios

### financeiro
- Cadastro/importação de títulos internos
- Consulta de títulos
- Status financeiro
- Relacionamento com conciliações

### gateways/rede
- Cliente HTTP da Rede
- Importação de transações
- Importação de recebíveis
- Normalização dos dados
- Persistência dos payloads brutos

### conciliacao
- Motor de matching
- Score
- Conciliação automática
- Divergências
- Conciliação manual

### auditoria
- Registro de eventos
- Histórico por entidade
- Antes/depois
- Justificativas

### jobs
- Importação periódica da Rede
- Normalização
- Execução da conciliação
- Registro de execução

## APIs mínimas

- `GET /api/titulos`
- `POST /api/titulos`
- `GET /api/rede/recebiveis`
- `POST /api/rede/importar`
- `POST /api/conciliacao/executar`
- `GET /api/conciliacao/divergencias`
- `POST /api/conciliacao/manual`
- `GET /api/auditoria/:entidade/:id`
- `GET /api/payloads`
- `GET /api/jobs`

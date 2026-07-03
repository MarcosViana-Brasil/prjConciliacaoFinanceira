# FIP Core MVP — Constitution

## Objetivo
Este documento define as regras obrigatórias e imutáveis para o desenvolvimento do MVP FIP Core.

## Regras fundamentais

1. Nunca apagar registros financeiros fisicamente.
2. Usar Soft Delete quando uma exclusão lógica for necessária.
3. Todo payload externo deve ser salvo em sua forma bruta antes de qualquer processamento.
4. Toda alteração financeira deve gerar evento de auditoria.
5. Toda alteração manual exige justificativa obrigatória.
6. Toda importação deve ser idempotente.
7. Toda entidade crítica deve usar UUID.
8. Toda entidade deve possuir createdAt e updatedAt.
9. Toda entidade financeira deve possuir metadata JSONB.
10. Nenhum token, senha ou segredo pode ser gravado em log.
11. Todo erro deve ser rastreável.
12. Toda integração externa deve salvar request, response, status, endpoint e hash do payload.
13. Nenhum valor financeiro deve ser sobrescrito sem histórico.
14. Toda conciliação deve informar origem, regra aplicada e score.
15. O MVP deve permanecer simples, modular e preparado para novos gateways.

## Escopo do MVP
O MVP deve implementar apenas:

- Gateway Rede/Itaú
- PostgreSQL
- Docker
- Backend Node.js/TypeScript
- Frontend Next.js/React
- Motor básico de conciliação
- Auditoria
- Painel administrativo
- Abertura arquitetural para novos gateways

## Fora do escopo inicial

- Microsserviços
- Kubernetes
- RabbitMQ
- Grafana
- Prometheus
- Event Sourcing completo
- CQRS completo
- Multi-tenant
- Open Finance
- Integração simultânea com vários gateways

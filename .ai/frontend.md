# FIP Core MVP — Frontend

## Objetivo
Criar um painel administrativo em Next.js/React para operação do MVP de conciliação.

## Stack

- Next.js
- React
- TypeScript
- TailwindCSS
- React Hook Form
- Zod
- TanStack Query opcional
- Lucide Icons
- Componentes reutilizáveis

## Telas mínimas

### Dashboard
Indicadores:
- Total de títulos
- Total recebido
- Total conciliado
- Total divergente
- Total não conciliado
- Última importação da Rede

### Títulos
Grid com:
- Número do título
- Cliente
- Valor
- Vencimento
- Status
- Gateway relacionado
- Situação de conciliação

### Recebíveis Rede
Grid com:
- NSU
- Autorização
- Valor bruto
- Valor líquido
- Taxas
- Data da venda
- Data prevista de crédito
- Status

### Conciliação
Tela principal:
- Título interno
- Recebível Rede sugerido
- Score
- Diferença de valor
- Diferença de data
- Status
- Ações

### Divergências
Listagem de itens que exigem análise manual.

### Auditoria
Histórico por entidade, título, recebível ou conciliação.

### Payloads Brutos
Tela técnica para visualizar payloads importados.

### Jobs
Execuções automáticas, status e erros.

## Regras de UI

- Interface limpa e objetiva.
- Priorizar grids e filtros.
- Toda ação manual deve abrir modal com justificativa obrigatória.
- Destacar divergências visualmente.
- Não esconder informações financeiras importantes.

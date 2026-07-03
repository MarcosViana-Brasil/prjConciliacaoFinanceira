# FIP Core MVP — Audit

## Objetivo
Garantir rastreabilidade completa de operações financeiras, integrações, alterações manuais e processos automáticos.

## Eventos auditáveis

- Criação de título
- Alteração de título
- Importação de payload
- Normalização de dados
- Execução de job
- Conciliação automática
- Conciliação manual
- Reversão de conciliação
- Alteração de status
- Exportação de relatório
- Visualização de payload bruto
- Erros de processamento

## Campos obrigatórios

- id
- entidade
- entidadeId
- ação
- usuário
- origem
- data/hora
- valor anterior
- valor novo
- justificativa
- IP
- userAgent
- metadata
- hashEvento

## Regras

- Auditoria não deve ser alterada.
- Auditoria não deve ser excluída.
- Auditoria deve ser consultável pelo painel.
- Auditoria deve permitir reconstruir a história de um título.
- Toda ação manual deve conter justificativa.
- Toda ação automática deve informar job ou processo responsável.

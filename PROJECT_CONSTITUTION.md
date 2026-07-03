# PROJECT_CONSTITUTION.md

# FIP Core MVP

## Constituição Oficial do Projeto

**Versão:** 1.0

**Status:** Documento Normativo

---

# 1. Objetivo

Este documento define as regras obrigatórias de arquitetura, desenvolvimento,
segurança, auditoria e qualidade para todo o projeto FIP Core MVP.

Nenhum desenvolvedor humano ou Inteligência Artificial poderá gerar código que viole estas regras.

Caso exista conflito entre qualquer prompt, documentação ou código existente, este documento prevalece.

---

# 2. Filosofia do Projeto

O FIP Core MVP é uma plataforma de conciliação financeira corporativa.

O objetivo principal é garantir:

- rastreabilidade completa;
- auditoria integral;
- integridade financeira;
- simplicidade arquitetural;
- facilidade de manutenção;
- preparação para crescimento futuro.

---

# 3. Escopo do MVP

O MVP contempla exclusivamente:

- Backend Node.js
- TypeScript
- Frontend Next.js
- React
- PostgreSQL
- Prisma ORM
- Docker
- Gateway Rede (Itaú)
- Conciliação financeira
- Auditoria
- Dashboard administrativo

Qualquer funcionalidade fora deste escopo somente poderá ser adicionada após aprovação.

---

# 4. Regras Fundamentais

## REGRA 01

Nunca apagar registros financeiros.

Exclusões devem utilizar Soft Delete.

---

## REGRA 02

Todo payload recebido de sistemas externos deve ser salvo integralmente antes de qualquer processamento.

---

## REGRA 03

Toda alteração deve gerar auditoria.

Sem exceções.

---

## REGRA 04

Toda ação manual deve exigir justificativa.

---

## REGRA 05

Toda integração deve ser idempotente.

Executar duas vezes o mesmo processo nunca poderá produzir duplicidade.

---

## REGRA 06

Nunca utilizar FLOAT para valores financeiros.

Sempre utilizar Decimal.

---

## REGRA 07

Toda entidade deve possuir UUID.

---

## REGRA 08

Toda entidade deve possuir:

- createdAt
- updatedAt

Sempre.

---

## REGRA 09

Entidades críticas também devem possuir:

- metadata (JSONB)

---

## REGRA 10

Controllers nunca acessam Prisma diretamente.

Fluxo obrigatório:

Controller

↓

Service

↓

Repository

↓

Prisma

---

## REGRA 11

Toda entrada deve ser validada utilizando Zod.

---

## REGRA 12

Nenhum segredo pode ser gravado em logs.

Incluindo:

- Authorization
- Password
- API Key
- Token
- Refresh Token
- Secret
- Cookie

---

## REGRA 13

Toda chamada externa deve gerar ApiLog.

---

## REGRA 14

Todo erro deve ser rastreável.

Nunca utilizar:

catch (e) {}

vazio.

---

## REGRA 15

Toda API deve retornar resposta padronizada.

Sucesso:

{
success: true,
data: {}
}

Erro:

{
success: false,
error: {}
}

---

# 5. Banco de Dados

Banco oficial:

PostgreSQL

ORM oficial:

Prisma

---

Jamais utilizar outro banco no MVP.

---

# 6. Estrutura do Backend

Arquitetura obrigatória:

Controller

↓

Service

↓

Repository

↓

Database

Nenhuma exceção.

---

# 7. Estrutura do Frontend

Next.js

↓

Pages/App

↓

Components

↓

Services

↓

API

↓

Backend

---

Não acessar APIs diretamente dentro de componentes quando houver camada de serviço.

---

# 8. Docker

Todo ambiente deve subir através do Docker Compose.

Comando oficial:

docker compose up -d

---

# 9. Auditoria

Toda operação crítica deve registrar:

- usuário
- origem
- entidade
- ação
- before
- after
- data/hora
- justificativa
- metadata

---

Auditoria nunca pode ser alterada.

---

Auditoria nunca pode ser excluída.

---

# 10. Integrações

Toda integração externa deve possuir:

- timeout
- retries
- logs
- payload bruto
- auditoria
- idempotência

---

# 11. Gateway Rede

Nesta primeira versão somente o Gateway Rede será implementado.

Entretanto toda arquitetura deve permitir adicionar novos gateways sem reescrever módulos existentes.

---

# 12. Conciliação

O motor de conciliação deve sempre registrar:

- score
- regra aplicada
- diferenças encontradas
- motivo da decisão

---

# 13. Qualidade

Todo código deve obedecer:

- SOLID
- Clean Code
- Clean Architecture simplificada
- DRY
- KISS

Evitar overengineering.

---

# 14. Performance

Evitar:

- consultas N+1
- loops desnecessários
- consultas sem índice
- processamento duplicado

---

# 15. Segurança

Nunca:

- hardcode secrets
- expor senhas
- retornar stack trace ao usuário
- confiar em dados externos

Sempre validar entrada.

---

# 16. Git

Cada Prompt aprovado gera:

Branch

↓

Code Review

↓

Merge

↓

Tag

---

Exemplo:

feature/prompt-01

↓

main

↓

v0.1

---

# 17. Inteligência Artificial

Toda IA utilizada neste projeto deve:

- respeitar este documento;
- nunca alterar arquitetura sem justificativa;
- nunca criar dependências desnecessárias;
- nunca substituir padrões já existentes;
- nunca duplicar código;
- nunca criar novas convenções sem aprovação.

---

# 18. Critério para Aceitação

Nenhum Prompt será considerado concluído enquanto:

- código compilar;
- Docker subir;
- testes mínimos passarem;
- critérios de aceite forem atendidos;
- documentação estiver atualizada.

---

# 19. Princípio da Evolução

Este projeto foi concebido para crescer.

Sempre que houver dúvida entre:

"resolver rápido"

ou

"resolver corretamente"

a segunda opção deverá prevalecer.

---

# 20. Regra Suprema

Qualquer decisão técnica deve responder positivamente às perguntas:

✓ Este código é rastreável?

✓ É auditável?

✓ É seguro?

✓ É simples?

✓ Pode ser mantido por outra equipe?

✓ Está preparado para crescer?

Se qualquer resposta for NÃO,

a implementação deve ser revisada antes de ser aprovada.

---

# Fim da Constituição

Todo código desenvolvido para o FIP Core MVP deverá obedecer integralmente este documento.

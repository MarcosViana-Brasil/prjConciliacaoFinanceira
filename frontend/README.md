# FIP Core Frontend

Painel administrativo em Next.js para o MVP de conciliacao financeira.

## Rodar localmente

```bash
cp .env.example .env.local
npm install
npm run dev
```

Por padrao, o frontend espera a API em `NEXT_PUBLIC_API_URL=http://localhost:3001` ao rodar backend fora do Docker. No Docker Compose, a variavel raiz `NEXT_PUBLIC_API_URL=http://localhost:3101` ja fica configurada para acessar a porta publicada do backend.

## Rotas do painel

- `/login` - autenticacao do usuario.
- `/dashboard` - resumo operacional de titulos, recebiveis e conciliacoes.
- `/titulos` - listagem paginada de titulos financeiros com filtros.
- `/titulos/novo` - cadastro manual de titulo financeiro.
- `/titulos/[id]` - detalhe do titulo.
- `/rede/transacoes` - transacoes normalizadas da Rede e acao de importacao.
- `/rede/recebiveis` - recebiveis normalizados da Rede e acao de importacao.
- `/conciliacao` - lista conciliacoes, executa motor e permite aprovar, rejeitar ou reverter.
- `/conciliacao/[id]` - detalhe da conciliacao.
- `/divergencias` - divergencias geradas pelo motor.
- `/auditoria` - eventos de auditoria.
- `/payloads` - payloads brutos recebidos/integrados.
- `/jobs` - execucoes de jobs.
- `/configuracoes` - configuracoes operacionais.

## Validacao

```bash
npm run build
npm run lint
```

O lint usa ESLint 9 com `eslint-config-next` em `eslint.config.mjs`.

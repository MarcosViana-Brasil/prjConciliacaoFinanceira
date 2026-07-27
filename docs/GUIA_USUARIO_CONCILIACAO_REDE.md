# Guia de Uso Diario - Conciliacao Rede/Itau

Este guia e destinado ao usuario da area financeira encarregado de operar o FIP Core para acompanhar, importar e conciliar dados do gateway Rede/Itau.

O objetivo do uso diario e simples:

1. Conferir se os titulos financeiros internos estao cadastrados.
2. Importar transacoes e recebiveis da Rede.
3. Executar a conciliacao.
4. Analisar divergencias.
5. Aprovar, rejeitar ou reverter conciliacoes quando necessario.
6. Consultar jobs, payloads e auditoria para rastrear o que aconteceu.

## Acesso ao Sistema

Abra o painel no navegador:

```text
http://localhost:3100
```

Na tela de login, informe seu e-mail e senha fornecidos pela administracao do sistema.

Depois do login, voce sera direcionado para o Dashboard.

## Perfis de Acesso

O que aparece no menu depende do seu perfil:

- `FINANCEIRO`: opera titulos, dados Rede, conciliacao, divergencias, payloads e jobs.
- `AUDITOR`: consulta dados financeiros, auditoria, payloads e jobs em modo de acompanhamento.
- `SOMENTE_LEITURA`: consulta telas operacionais basicas.
- `ADMIN`: acessa configuracoes e administracao do ambiente.

Se uma tela esperada nao aparecer no menu, solicite revisao do seu perfil de acesso.

## Rotina Recomendada do Dia

### 1. Verificar o Dashboard

Entre em `Dashboard`.

Use esta tela para uma leitura rapida do ambiente:

- Total de titulos carregados.
- Total em aberto.
- Total conciliado.
- Valor recebido pela Rede.

Se o dashboard estiver vazio ou com numeros inesperados, verifique primeiro se o periodo do dia ja foi importado e se existem titulos cadastrados.

### 2. Conferir Titulos Financeiros

Entre em `Titulos`.

Esta tela mostra os titulos financeiros internos que serao comparados com os dados da Rede.

Use a lista para conferir:

- Numero do titulo.
- Cliente.
- Valor bruto.
- Vencimento.
- Status.
- Gateway.

Para abrir um titulo, clique no numero do titulo.

No detalhe do titulo, confira dados como cliente, documento, valor bruto, valor liquido esperado, vencimento, pedido, gateway, NSU e autorizacao.

### 3. Cadastrar Titulo Manualmente

Use `Titulos > Novo titulo` quando precisar cadastrar um titulo que ainda nao veio de importacao interna.

Campos mais importantes:

- Numero do titulo.
- Cliente.
- Valor bruto.
- Vencimento.
- Gateway.
- Justificativa.

Quando houver dados da venda, preencha tambem NSU, autorizacao, TID ou Transaction ID. Esses campos ajudam o motor de conciliacao a encontrar o match correto com a Rede.

Toda acao manual deve ter justificativa clara, pois ela pode aparecer na auditoria.

### 4. Importar Transacoes Rede

Entre em `Transacoes Rede`.

Clique em `Importar`.

Informe:

- Data inicial.
- Data final.

Clique em `Executar importacao`.

Depois da importacao, confira a lista de transacoes. Ela deve mostrar dados normalizados da Rede, como Transaction ID, valores, datas e identificadores de venda.

Use esta tela quando precisar validar se as vendas capturadas pela Rede chegaram ao sistema.

### 5. Importar Recebiveis Rede

Entre em `Recebiveis Rede`.

Clique em `Importar`.

Informe:

- Data inicial.
- Data final.

Clique em `Executar importacao`.

Depois da importacao, confira a lista de recebiveis. Esta tela e importante para acompanhar valores liquidados ou previstos para liquidacao pela Rede.

### 6. Executar Conciliacao

Entre em `Conciliacao`.

Clique em `Executar conciliacao`.

Informe:

- Data inicial.
- Data final.

Clique em `Executar`.

O sistema compara os titulos internos com transacoes e recebiveis da Rede. O resultado aparece na lista de conciliacoes.

Principais campos para acompanhar:

- Status da conciliacao.
- Score.
- Nivel do match.
- Diferencas de valor.
- Regra aplicada.

Quanto maior o score, maior a confianca do sistema no relacionamento entre titulo interno e dados da Rede.

### 7. Analisar Resultados da Conciliacao

Na tela `Conciliacao`, use os filtros de status para separar os casos:

- `Automatica`: conciliacao feita automaticamente com seguranca.
- `Manual`: conciliacao aprovada manualmente.
- `Divergente`: ha diferencas ou sinais de inconsistencia.
- `Nao encontrado`: o sistema nao encontrou contraparte suficiente.
- `Revertido`: conciliacao desfeita.

Clique no codigo da conciliacao para abrir o detalhe.

No detalhe, confira:

- Score.
- Nivel.
- Regra aplicada.
- Diferenca de valor bruto.
- Diferenca de valor liquido.
- Data de criacao.

### 8. Tratar Divergencias

Entre em `Divergencias`.

Use esta tela para revisar diferencas geradas pelo motor de conciliacao.

Exemplos de divergencias comuns:

- Valor recebido diferente do valor esperado.
- Parcela diferente.
- Data diferente.
- Dados insuficientes para match automatico.

Antes de decidir, confira o titulo, a transacao Rede e o recebivel relacionado.

### 9. Aprovar, Rejeitar ou Reverter

Na tela `Conciliacao`, cada linha pode apresentar acoes:

- `Aprovar`: use quando a conciliacao esta correta, mesmo que precise de decisao manual.
- `Rejeitar`: use quando a sugestao do sistema nao representa uma conciliacao valida.
- `Reverter`: use quando uma conciliacao ja aceita precisa ser desfeita.

Sempre informe uma justificativa objetiva.

Bons exemplos de justificativa:

- `Aprovado manualmente apos conferencia do NSU e valor liquido.`
- `Rejeitado porque a transacao pertence a outro pedido.`
- `Revertido por ajuste posterior no titulo financeiro.`

Evite justificativas vagas, como `ok`, `ajuste` ou `corrigido`.

### 10. Acompanhar Jobs

Entre em `Jobs`.

Esta tela mostra execucoes de rotinas como:

- Importacao de transacoes Rede.
- Importacao de recebiveis Rede.
- Conciliacao.

Use os botoes:

- `Transacoes`: executa job de importacao de transacoes Rede.
- `Recebiveis`: executa job de importacao de recebiveis Rede.
- `Conciliar`: executa job de conciliacao.

Na lista, confira:

- Status.
- Inicio e fim.
- Duracao.
- Quantidade processada.
- Sucessos.
- Erros.
- Mensagem.

Se um job falhar, copie a mensagem de erro e acione o responsavel tecnico.

### 11. Consultar Payloads

Entre em `Payloads`.

Payload e o registro bruto recebido ou gerado durante uma integracao. Ele serve para rastrear o dado original antes da normalizacao.

Use esta tela quando:

- Uma transacao nao aparecer como esperado.
- Um recebivel veio com valor divergente.
- For necessario investigar o retorno bruto da Rede.
- Um payload precisar ser reprocessado.

Ao reprocessar um payload, informe uma justificativa clara.

### 12. Consultar Auditoria

Entre em `Auditoria`.

Esta tela mostra eventos relevantes do sistema, como criacao, alteracao, aprovacao manual, rejeicao, reversao e mudancas de configuracao.

Use auditoria para responder perguntas como:

- Quem aprovou uma conciliacao manual?
- Quando um titulo foi alterado?
- Qual justificativa foi informada?
- Qual entidade foi afetada?

## Checklist Diario

Use este checklist no inicio ou fim do expediente:

- Acessar o Dashboard e conferir totais principais.
- Verificar se os titulos do periodo existem em `Titulos`.
- Importar `Transacoes Rede` do periodo.
- Importar `Recebiveis Rede` do periodo.
- Executar `Conciliacao` para o mesmo periodo.
- Revisar itens `Divergentes` e `Nao encontrado`.
- Registrar decisoes manuais com justificativa.
- Conferir `Jobs` para garantir que nao houve falhas.
- Consultar `Payloads` e `Auditoria` quando houver duvida.

## Situacoes Comuns

### Nao consigo entrar

Confira e-mail e senha. Se o erro persistir, solicite ao administrador a verificacao do usuario e do perfil de acesso.

### Uma tela nao aparece no menu

Provavelmente seu perfil nao possui permissao para aquela tela. Solicite revisao ao administrador.

### O dashboard esta sem dados

Verifique se:

- O seed ou a carga inicial foi executada no ambiente.
- Existem titulos cadastrados.
- A importacao da Rede foi executada.
- O backend esta online.

### A importacao nao trouxe dados

Verifique:

- Periodo informado.
- Se a Rede esta em modo mock ou integracao real.
- Se houve erro na tela `Jobs`.
- Se existe payload em `Payloads`.

### A conciliacao nao encontrou correspondencia

Confira se o titulo e os dados Rede possuem algum identificador em comum:

- NSU.
- Codigo de autorizacao.
- TID.
- Transaction ID.
- Numero do pedido.
- Valor.
- Data.

Quanto mais dados consistentes, maior a chance de match automatico.

### Existe divergencia de valor

Compare:

- Valor bruto do titulo.
- Valor liquido esperado.
- Valor da transacao Rede.
- Valor do recebivel Rede.
- Taxas, antecipacoes, ajustes ou chargebacks.

Se a divergencia for esperada, registre a decisao manual com justificativa.

## Boas Praticas

- Use sempre o mesmo periodo para importar transacoes, importar recebiveis e executar conciliacao.
- Revise divergencias antes de aprovar manualmente.
- Escreva justificativas que outra pessoa consiga entender no futuro.
- Consulte Jobs quando uma acao parecer nao ter surtido efeito.
- Consulte Payloads antes de concluir que a Rede nao enviou um dado.
- Consulte Auditoria antes de perguntar quem alterou ou aprovou algo.
- Nao compartilhe usuario e senha.

## Fluxo Resumido

```text
Login
  -> Dashboard
  -> Titulos
  -> Transacoes Rede: Importar
  -> Recebiveis Rede: Importar
  -> Conciliacao: Executar conciliacao
  -> Divergencias: Revisar pendencias
  -> Conciliacao: Aprovar/Rejeitar/Reverter quando necessario
  -> Jobs/Payloads/Auditoria: Consultar rastreabilidade
```


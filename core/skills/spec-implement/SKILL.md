---
name: spec-implement
description: Implementa a próxima tarefa pendente (ou a tarefa indicada) de uma spec aprovada (fase 4).
argument-hint: <nome-ou-numero-da-feature> [numero-da-tarefa]
disable-model-invocation: true
---

Implemente uma tarefa da spec indicada: $ARGUMENTS

1. Localize a pasta em `specs/`. Leia `requirements.md`, `design.md` e `tasks.md`. Se `tasks.md` não estiver `aprovado`, pare e peça aprovação.
2. Escolha a tarefa indicada ou, se nenhuma foi informada, a primeira não marcada. Implemente **apenas essa tarefa**.
3. Siga o arquivo de instruções do projeto e `docs/steering/` (incluindo `style.md`, se existir). É proibido alterar comportamento existente que não esteja em um critério de aceite (validação, cálculo, status, permissão, mensagem, formato de resposta).
4. Se descobrir que a spec está errada ou incompleta, pare, explique a divergência e proponha a alteração na spec antes de seguir.
5. Rode os comandos de `docs/steering/tech.md` › Comandos de verificação. Só marque `[x]` em `tasks.md` se todos passarem. Se a seção ainda não estiver preenchida, pare e pergunte os comandos (pergunta interativa, sugerindo os que existem no projeto, como scripts e CI).
6. Quando todas as tarefas estiverem concluídas, atualize o Status dos três arquivos para `implementado`.
7. Termine dizendo o que foi feito e como verificar (teste ou `docs/steering/tech.md` › Verificação manual). Se todas as tarefas estiverem concluídas, lembre da tarefa de verificação final e de revisão humana do PR (não faça commit sem pedido explícito). Se ainda houver tarefas pendentes, solicite aprovação e avanço com a ferramenta de perguntas interativas do agente:
   - `(Recomendado) Aprovar e implementar a próxima tarefa: [T<número> - <nome>]`
   - `Solicitar ajustes na tarefa recém-implementada`
   - `Pausar por aqui`
   Se a pessoa escolher a opção recomendada: execute a próxima tarefa imediatamente. Não faça commit sem pedido explícito.

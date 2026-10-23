---
name: spec-tasks
description: Quebra o design aprovado de uma spec em tarefas incrementais (fase 3).
argument-hint: <nome-ou-numero-da-feature>
disable-model-invocation: true
---

Crie o plano de **tarefas** da spec indicada: $ARGUMENTS

1. Localize a pasta em `specs/`. Leia `requirements.md` e `design.md` — se algum não estiver com Status `aprovado`, pare e peça aprovação.
2. Escreva `tasks.md` a partir de `specs/_templates/tasks.md`:
   - tarefas pequenas, ordenadas por dependência, cada uma deixando o projeto compilando;
   - fundações primeiro (na ordem de `docs/steering/structure.md` › Ordem das fundações), depois um bloco por requisito, com os testes dele;
   - cada tarefa cita os requisitos que atende (`_Requisitos: X.Y_`) ou as regras que preserva (`_Preserva: Pn_`);
   - todo critério de aceite e toda regra preservada precisa ser coberto por ao menos uma tarefa — registre isso na seção **Cobertura**;
   - última tarefa é sempre a verificação final.
3. Mantenha **Status: rascunho**. Não escreva código.
4. Termine listando as tarefas e pedindo aprovação antes de `/spec-implement`.

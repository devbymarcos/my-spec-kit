---
name: spec-design
description: Gera o design técnico (fase 2) de uma spec com requisitos aprovados.
argument-hint: <nome-ou-numero-da-feature>
disable-model-invocation: true
---

Crie a fase de **design técnico** da spec indicada: $ARGUMENTS

1. Localize a pasta em `specs/`. Leia `requirements.md` — se o Status não for `aprovado` ou ainda houver perguntas em aberto, pare e peça aprovação primeiro.
2. Leia `docs/steering/*.md`, `specs/_templates/design.md` e o código existente das áreas afetadas. Siga os padrões que já existem no código.
3. Escreva `design.md` a partir do template, preenchendo todas as seções dele — em especial impacto em comportamento existente, arquivos envolvidos (organizados conforme `docs/steering/structure.md`), tratamento de erros, estratégia de testes e checklist do steering. Seção que não se aplica recebe "Não se aplica". Toda decisão deve se ligar a algum requisito. Se `docs/steering/style.md` existir, siga-o nas decisões visuais.
4. Se o design só funcionar mudando uma regra preservada que não está autorizada nos requisitos, pare e pergunte (pergunta interativa, com as alternativas de design como opções). O mesmo vale para qualquer decisão em que haja mais de uma alternativa razoável.
5. Respeite os avisos ativos do projeto (`docs/steering/tech.md` › Avisos ativos e o arquivo de instruções do projeto).
6. Mantenha **Status: rascunho**. Não escreva código nem `tasks.md`.
7. Termine resumindo as decisões principais e pedindo aprovação antes de `/spec-tasks`.

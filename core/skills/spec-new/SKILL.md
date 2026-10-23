---
name: spec-new
description: Inicia uma nova spec (fase 1 — requisitos) em specs/NNN-<feature>/requirements.md a partir do template.
argument-hint: <nome-da-feature> [descrição]
disable-model-invocation: true
---

Crie a fase de **requisitos** de uma nova feature seguindo `specs/README.md`.

Entrada: $ARGUMENTS

1. Leia `specs/README.md`, `docs/steering/*.md` e `specs/_templates/requirements.md`.
2. Siga a regra de branch do arquivo de instruções do projeto, se houver: se estiver na branch principal ou em branch de outra tarefa, sugira o nome da branch e só crie depois da autorização.
3. Descubra o próximo número livre em `specs/` e crie `specs/NNN-<nome-em-kebab-case>/requirements.md` a partir do template.
4. Leia o código das áreas que a feature vai tocar e liste em **Comportamento existente preservado** as regras de negócio atuais que não podem mudar, citando o arquivo de cada uma.
5. Preencha com o que a pessoa descreveu. Escreva os critérios de aceite no formato EARS, numerados e testáveis, com valores concretos (limites, mensagens, códigos ou status). O que não estiver claro vai em **Perguntas em aberto** — não invente regra de negócio. Requisito que contradiz uma regra preservada também vira pergunta.
6. Mantenha **Status: rascunho**. Não crie `design.md`, `tasks.md` nem código.
7. Termine resumindo os requisitos e listando as perguntas em aberto, pedindo revisão e aprovação antes de `/spec-design`. Quando a pessoa responder, registre as respostas em **Decisões**.

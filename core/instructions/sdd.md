## Spec-Driven Development

Contexto global do projeto (steering), carregado junto com este arquivo:
- Produto: @docs/steering/product.md
- Stack, padrões de código e comandos de verificação: @docs/steering/tech.md
- Estrutura do projeto: @docs/steering/structure.md

Funcionalidades seguem o fluxo de specs: `requirements.md` → `design.md` → `tasks.md` → implementação, com aprovação entre cada fase (Status `rascunho` → `aprovado` → `implementado`). As specs ficam versionadas em `specs/NNN-<feature>/`, com modelos em `specs/_templates/`. Este arquivo e o `docs/steering/` funcionam como a constituição do projeto: todo `design.md` deve passar pelo checklist deles.
- Comandos: `/spec-new` → `/spec-design` → `/spec-tasks` → `/spec-implement` (uma tarefa por vez)
- Steering: `/spec-steering [product|tech|structure] [contexto]` cria ou atualiza `docs/steering/` a partir do contexto dado, do código e de perguntas sobre o que faltar
- Padrões visuais (opcional, só em front): se existir `docs/steering/style.md`, siga-o em qualquer mudança visual.
- Guia: `specs/README.md`
- Requisitos sempre em EARS. Dúvidas de regra de negócio são perguntadas, nunca assumidas.
- **Regras de negócio existentes não podem ser alteradas** sem um critério de aceite aprovado que diga isso explicitamente.
- Se existir uma spec para a tarefa atual, ela é a fonte da verdade. Divergências entre código e spec devem ser apontadas ao usuário antes de implementar.
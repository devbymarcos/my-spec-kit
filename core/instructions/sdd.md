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
- **Perguntas são interativas.** Sempre que precisar perguntar algo à pessoa, use a ferramenta de perguntas do agente (no Claude Code, `AskUserQuestion`), em vez de uma lista numerada para ela responder por texto:
  - até 4 perguntas por vez, cada uma com um título curto e de 2 a 4 opções de resposta;
  - as opções são sugestões concretas, tiradas do contexto, do código ou de práticas usuais, cada uma com uma descrição curta do que implica; a recomendada vem primeiro, com "(Recomendado)" no rótulo;
  - não crie a opção "Outro": a ferramenta já oferece um campo livre para respostas diferentes;
  - use seleção múltipla quando as opções não se excluem (ex.: quais módulos existem);
  - só pergunte por texto quando não houver sugestão razoável (ex.: descrever o produto com as próprias palavras).
- **Regras de negócio existentes não podem ser alteradas** sem um critério de aceite aprovado que diga isso explicitamente.
- Se existir uma spec para a tarefa atual, ela é a fonte da verdade. Divergências entre código e spec devem ser apontadas ao usuário antes de implementar.
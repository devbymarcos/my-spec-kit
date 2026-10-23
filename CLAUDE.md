# CLAUDE.md — my-spec-kit

Kit de Spec-Driven Development para agentes de IA: skills, templates e uma CLI (`my-spec-kit init | update | doctor | version`) que instala tudo em qualquer projeto. Arquitetura e decisões em @docs/architecture.md. Etapas em `docs/implementation-plan.md`.

## Próximos passos

As pendências ficam nas **issues do GitHub** (`devbymarcos/my-spec-kit`). Ao retomar o trabalho, comece por `gh issue list --repo devbymarcos/my-spec-kit` e siga a ordem: #1 (teste manual das skills), depois as Etapas 2 a 7. Ao concluir uma etapa, marque os itens da issue e atualize a tabela de situação do `implementation-plan.md`.

## Regras do kit

- **Agnóstico.** Nada versionado pode citar projetos, empresas, domínios ou tecnologias de projetos reais, nem produtos de terceiros como origem da metodologia. Exemplos em skills e templates são placeholders ou cobrem vários ecossistemas.
- **v1 só para Claude Code.** Outros agentes entram depois, via adapter (`docs/architecture.md` › 8). Não implemente adapters de outros agentes sem pedido.
- **O conteúdo é o produto.** Skills, templates e steering ficam em `core/`, em Markdown. As skills são iguais para todo projeto; o que varia por projeto é lido do steering (`docs/steering/` do projeto de destino), nunca escrito na skill.
- **Tipos de projeto:** `api` e `front`. Só `requirements.md` e `design.md` mudam por tipo (`core/specs/_templates/api|front/`); `spec-style` só é instalada em front.
- **A CLI nunca toca no que não é do kit.** Só arquivos do manifesto ou o bloco marcado no `CLAUDE.md` do projeto de destino. Personalização nunca é sobrescrita sem `--force`.
- Sem dependências de runtime. Node ≥ 20, TypeScript `strict`, ESM.
- Mudou uma decisão de arquitetura? Atualize `docs/architecture.md` (seção 12) na mesma alteração.

## Idioma

Conversa, documentação, skills e templates em **PT-BR**. Identificadores de código em inglês. Nomes de testes em inglês.

## Comandos

```bash
npm install
npm run typecheck
npm test
npm run build
node dist/cli/index.js version
```

Rode `npm run typecheck` e `npm test` antes de considerar qualquer tarefa concluída.

## Arquivos locais (fora do git)

- `docs/analysis/`: material de referência local. Nunca deve ir para o repositório.
- `tests/core/forbidden-terms.local.txt`: lista de termos proibidos (um regex por linha) usada por `tests/core/content.test.ts`. Sem ela, esse teste é pulado.

## Git

- Não faça commit nem push sem pedido explícito.
- Mensagens em PT-BR, no padrão Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`).
- O repositório é público: antes de cada commit, confira que nada citado em "Agnóstico" entrou nos arquivos.

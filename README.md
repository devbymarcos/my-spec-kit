# my-spec-kit

Kit de **Spec-Driven Development** para agentes de IA. Instala num projeto existente, de qualquer linguagem:

- o fluxo de specs `requirements.md` → `design.md` → `tasks.md` → implementação, com aprovação humana entre as fases;
- templates com requisitos em EARS, comportamento existente preservado e rastreabilidade até as tarefas, em duas versões: **api** e **front**;
- skills para o agente conduzir cada fase (`/spec-steering`, `/spec-new`, `/spec-design`, `/spec-tasks`, `/spec-implement`) e, em projetos front, definir padrões visuais quando quiser (`/spec-style`);
- esqueletos de steering (produto, stack, estrutura e comandos de verificação) para o projeto preencher.

> **Estado:** v0.1.0, em desenvolvimento. `init` e `version` funcionam; `update` e `doctor` ainda não. Agente suportado: **Claude Code**.

## Instalar num projeto

Na pasta do projeto:

```bash
npx github:devbymarcos/my-spec-kit init --type api     # ou --type front
```

O `init` mostra o plano antes de aplicar e pede confirmação. Ele:

- cria as skills em `.claude/skills/`, os templates em `specs/_templates/` e o steering em `docs/steering/`;
- acrescenta um bloco marcado ao fim do `CLAUDE.md`, sem mexer no resto do arquivo;
- **nunca sobrescreve** um arquivo que já existe e é diferente: ele aparece como conflito. Para sobrescrever, use `--force`, que guarda uma cópia em `.my-spec-kit/backup/`;
- registra o que instalou em `.my-spec-kit/manifest.json`.

Opções: `--dry-run` mostra o plano sem alterar nada; `--yes` aplica sem perguntar.

Depois, no Claude Code:

1. `/spec-steering`: preenche o steering a partir do código (ou com perguntas, se o projeto for novo).
2. `/spec-new <feature> <descrição>` → `/spec-design` → `/spec-tasks` → `/spec-implement`, aprovando cada fase.

## Desenvolvimento

```bash
npm install
npm run typecheck
npm test
npm run build
node dist/cli/index.js init --type api --dry-run
```

## Documentação

- [Arquitetura](docs/architecture.md)
- [Plano de implementação](docs/implementation-plan.md)

## Licença

MIT

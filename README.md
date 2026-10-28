# my-spec-kit

Kit de **Spec-Driven Development** para agentes de IA. Instala num projeto existente, de qualquer linguagem:

- o fluxo de specs `requirements.md` → `design.md` → `tasks.md` → implementação, com aprovação humana entre as fases;
- templates com requisitos em EARS, comportamento existente preservado e rastreabilidade até as tarefas, em duas versões: **api** e **front**;
- skills para o agente conduzir cada fase (`/spec-steering`, `/spec-new`, `/spec-design`, `/spec-tasks`, `/spec-implement`) e, em projetos front, definir padrões visuais quando quiser (`/spec-style`);
- esqueletos de steering (produto, stack, estrutura e comandos de verificação) para o projeto preencher.

> **Estado:** v0.1.0, em desenvolvimento. `init`, `update` e `version` funcionam; `doctor` ainda não. Agente suportado: **Claude Code**.

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

1. `/spec-steering [contexto]`: preenche o steering a partir do contexto que você passar (texto livre ou caminhos de arquivos), do código, se o projeto existir, e de perguntas sobre o que faltar. Use `/spec-steering tech` (ou `product`, `structure`) para trabalhar num arquivo só.
2. `/spec-new` → `/spec-design` → `/spec-tasks` → `/spec-implement`, aprovando cada fase. A spec pode começar de duas formas:
   - de texto livre: `/spec-new <feature> <descrição>`, numerada em sequência;
   - de uma issue do repositório remoto: `/spec-new #42 [feature]` (ou o link da issue). A pasta fica `specs/042-<feature>/`, e a issue só é lida, nunca alterada.

## Atualização

Quando sair uma versão nova do kit, rode na raiz do projeto:

```bash
npx github:devbymarcos/my-spec-kit update
```

O `update` usa o tipo e o agente registrados no manifesto e mostra o plano antes de aplicar. Ele:

- atualiza os arquivos do kit que você não editou e cria os que são novos;
- remove os que saíram do kit, se você não os editou;
- muda só o conteúdo entre os marcadores do bloco no `CLAUDE.md`;
- **nunca toca** no steering (`docs/steering/`) nem nas specs;
- lista como conflito os arquivos que você editou e os mantém como estão. Para sobrescrever, use `--force`, que guarda uma cópia em `.my-spec-kit/backup/`.

Opções: as mesmas do `init` (`--dry-run`, `--yes`, `--force`). O `npx` pode reaproveitar uma versão em cache; para garantir a mais recente, informe a branch ou o commit: `npx github:devbymarcos/my-spec-kit#main update`.

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

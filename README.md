# my-spec-kit

Kit de **Spec-Driven Development** para agentes de IA. Instala num projeto existente, de qualquer linguagem:

- o fluxo de specs `requirements.md` → `design.md` → `tasks.md` → implementação, com aprovação humana entre as fases;
- templates com requisitos em EARS, comportamento existente preservado e rastreabilidade até as tarefas;
- skills para o agente conduzir cada fase (`/spec-new`, `/spec-design`, `/spec-tasks`, `/spec-implement`), começando sempre de uma descrição em texto livre;
- esqueletos de steering (produto, stack, estrutura e comandos de verificação) para o projeto preencher.

> **Estado:** em desenvolvimento (v0.1.0). A CLI ainda não instala nada; só `version` funciona. Agente suportado na v1: **Claude Code**.

## Uso (planejado)

```bash
npx github:devbymarcos/my-spec-kit init --agent claude
npx github:devbymarcos/my-spec-kit update
npx github:devbymarcos/my-spec-kit doctor
npx github:devbymarcos/my-spec-kit version
```

## Desenvolvimento

```bash
npm install
npm run build
npm test
```

## Documentação

- [Arquitetura](docs/architecture.md)
- [Plano de implementação](docs/implementation-plan.md)

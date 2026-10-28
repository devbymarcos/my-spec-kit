# Plano de implementação do `my-spec-kit`

- **Data:** 2026-10-23
- **Referência:** [arquitetura](architecture.md)
- **Escopo:** v1 só com Claude Code.

Cada etapa termina com uma **parada para revisão**: nenhuma etapa começa antes da aprovação da anterior. As etapas são pequenas o bastante para virar um PR cada.

| Etapa | Situação |
| --- | --- |
| 0. Base do repositório | concluída |
| 1. Conteúdo do `core/` | concluída |
| 2. Engine | concluída |
| 3. Adapter Claude + `init` | concluída |
| 4. `update` | concluída |
| 5 a 7 | pendentes |

---

## Etapa 0: Base do repositório (concluída)

**Entregáveis**
- `git init`, `.gitignore`, `.gitattributes` (LF), `README.md`, `LICENSE` (MIT).
- `package.json` (`type: module`, `engines.node >= 20`, `bin`, `files`, scripts `build`, `typecheck`, `test`, `prepare`).
- `tsconfig.json` (`strict`, ESM) e `tsconfig.build.json` (`outDir: dist`).
- Vitest configurado.

**Aceite**
- `npm install && npm run build && npm test` passam em Windows.
- `node dist/cli/index.js version` imprime a versão do `package.json`.

---

## Etapa 1: Conteúdo do `core/` (concluída)

O conteúdo vem antes do código porque é ele que carrega a metodologia.

**Entregáveis**
- `core/specs/README.md`; templates `requirements.md`/`design.md` em duas versões (`api/` e `front/`) e `tasks.md` comum.
- `core/steering/{product,tech,structure}.md` como esqueletos.
- Skills `spec-steering`, `spec-new`, `spec-design`, `spec-tasks`, `spec-implement` e `spec-style` (só front).
- `core/instructions/sdd.md`.

**Testes** (`tests/core/content.test.ts`)
- Frontmatter de cada `SKILL.md` (`name` igual ao nome da pasta, `description` com até 1024 caracteres, `disable-model-invocation: true`).
- Lista de skills esperada.
- Seções da metodologia presentes nos templates dos dois tipos.
- Termos proibidos em `core/`, lidos de uma lista local fora do git (`tests/core/forbidden-terms.local.txt`). Sem a lista, o teste é pulado.

---

## Etapa 2: Engine (concluída)

**Entregáveis**
- `hash.ts`: sha256 com normalização CRLF → LF.
- `manifest.ts`: tipos, leitura, validação e escrita (inclui `projectType`).
- `block.ts`: localizar, inserir e substituir o bloco entre marcadores; detectar bloco editado ou corrompido (marcador sem par).
- `catalog.ts`: lista os arquivos de `core/` para um tipo de projeto, com tipo de arquivo (gerenciado/semente/bloco) e caminho de destino via adapter.
- `plan.ts`: função pura `(catálogo, estado do projeto, manifesto) → ações` com os tipos `create`, `update`, `unchanged`, `conflict`, `skip-seed`, `remove`.
- `apply.ts`: executa as ações; com `force`, faz backup em `.my-spec-kit/backup/<timestamp>/`.

**Aceite e testes (unitários)**
- Arquivo inexistente → `create`.
- Arquivo existente sem manifesto e com conteúdo diferente → `conflict`; com conteúdo igual → `unchanged` (adotado no manifesto).
- Arquivo gerenciado com hash igual ao manifesto e versão nova no kit → `update`.
- Arquivo gerenciado editado → `conflict`, que vira `update` com backup só quando `force` é usado.
- Semente existente → `skip-seed` sempre.
- Arquivo removido do kit e não editado → `remove`; editado → `conflict`.
- Mesmo conteúdo com CRLF e LF → mesmo hash.
- Catálogo `api` não inclui `spec-style`; catálogo `front` inclui. Os dois instalam `requirements.md`/`design.md` da versão certa em `specs/_templates/`.
- Bloco: inserir em arquivo vazio, em arquivo com conteúdo e substituir; o texto fora do bloco permanece **byte a byte** igual.

---

## Etapa 3: Adapter Claude + `init` (concluída)

**Entregáveis**
- `adapters/types.ts`, `adapters/claude.ts`, `adapters/registry.ts`.
- `init` com `--type`, `--agent`, `--dry-run`, `--yes` e `--force`; plano exibido em tabela legível; confirmação interativa.

**Aceite e testes (CLI em diretório temporário)**
- Projeto vazio: `init --type api --agent claude --yes` cria exatamente os arquivos de `architecture.md` › 5 para o tipo api (sem `spec-style`) e o manifesto com `projectType: "api"`.
- `init --type front …` instala os templates de front e a skill `spec-style`, e **não** cria `docs/steering/style.md`.
- `--type` ausente em modo não interativo: erro pedindo o tipo. `--type` inválido: erro listando `api` e `front`.
- Projeto com `CLAUDE.md` existente: o bloco é adicionado ao fim e o restante fica intacto.
- Projeto com uma skill de mesmo nome já personalizada e sem manifesto: conflito informado, arquivo intacto, código de saída indicando conflitos.
- Rodar `init` duas vezes: a segunda execução não altera nada.
- **Arquivos não gerenciados intactos:** snapshot (caminho + hash) de todo o diretório antes e depois; só os caminhos do plano mudam.
- `--dry-run` não escreve nada.
- Agente sem adapter (ex.: `--agent codex`): erro "ainda não suportado nesta versão". `--agent all` instala o Claude.
- Sem `--yes` e sem terminal interativo: aborta pedindo `--yes`, sem travar.

---

## Etapa 4: `update` (concluída)

**Entregáveis**
- `update` com `--dry-run`, `--yes` e `--force`, usando o mesmo `plan`/`apply` e o `projectType` do manifesto.

**Aceite e testes**
- Sem manifesto: erro orientando a rodar `init`.
- Simulação de nova versão (catálogo de teste alternativo):
  - arquivo não editado → atualizado e hash novo no manifesto;
  - arquivo editado → conflito, intacto;
  - arquivo novo no kit → criado;
  - arquivo removido do kit → removido se não editado;
  - semente → nunca tocada;
  - bloco do `CLAUDE.md` → só o miolo muda.
- `kitVersion` e `updatedAt` atualizados no manifesto.

---

## Etapa 5: `doctor` e `version`

**Entregáveis**
- `doctor` com as verificações de `architecture.md` › 9, cada uma com resultado `ok`/`aviso`/`erro` e uma dica de correção.
- `version` mostrando a CLI e a versão instalada.

**Aceite e testes**
- Um cenário de teste para cada verificação (manifesto ausente, arquivo gerenciado ausente, editado, bloco ausente, `<completar>` no steering, Status inválido, número de spec duplicado).
- `doctor` nunca escreve em disco (verificado por snapshot).
- Código de saída `1` se houver erro, `0` se houver só avisos.

---

## Etapa 6: Validação com projetos existentes

**Entregáveis**
- Roteiro para rodar o `init` numa **cópia temporária** de um projeto existente (nunca no original), um de cada tipo (`api` e `front`).
- Conferir o plano gerado, os conflitos esperados (arquivos já personalizados aparecem como conflito, nunca sobrescritos) e o fluxo completo no Claude Code: `/spec-steering` → `/spec-new` → `/spec-design` → `/spec-tasks` → `/spec-implement`.

**Aceite**
- O projeto original continua sem nenhuma alteração.
- O fluxo completo funciona nos dois tipos.
- **Revisão humana.** O resultado da validação fica fora do repositório.

---

## Etapa 7: Distribuição

**Entregáveis**
- Push para o repositório público `devbymarcos/my-spec-kit`.
- README com instalação via `npx github:devbymarcos/my-spec-kit init`.
- Conferência do pacote com `npm pack --dry-run` (só `dist/`, `core/`, `README.md` e `LICENSE`).
- `CHANGELOG.md` e a política de versão (semver: mudança em `core/` que altera comportamento de skill = minor; quebra de formato do manifesto = major).

**Aceite**
- Num diretório limpo: `npx github:devbymarcos/my-spec-kit init --type api --agent claude --yes` funciona.
- A publicação no npm **não** é feita nesta etapa, só preparada.

---

## Fora do escopo da v1

| Item | Motivo |
| --- | --- |
| Adapters de outros agentes | A interface fica pronta (`architecture.md` › 8). |
| `/spec-review` | Adiado (`architecture.md` › 3). |
| Abrir PR e escrever em issues | Política de repositório é de cada projeto. O `/spec-new` só **lê** a issue de origem, e o `/git` vai até o push (`architecture.md` › D8). |
| Mais tipos além de `api`/`front` (ex.: separar web e app) | Por enquanto só dois tipos. |
| Projeto com API e front no mesmo repositório | Um tipo por instalação na v1. Reavaliar se surgir o caso. |
| Idioma configurável | Dobra a manutenção do conteúdo. O conteúdo é em PT-BR. |
| Validador de specs em CI | Fora do escopo da v1. |
| Publicação no npm | Só preparada na Etapa 7. |

## Ordem e dependências

```
0 Base ─► 1 Conteúdo ─► 2 Engine ─► 3 init ─► 4 update ─► 5 doctor/version ─► 6 Validação ─► 7 Distribuição
```

As Etapas 4 e 5 dependem só da 2 e da 3 e podem ser feitas em qualquer ordem entre si.

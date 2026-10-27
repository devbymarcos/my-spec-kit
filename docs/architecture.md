# Arquitetura do `my-spec-kit`

- **Status:** aprovada
- **Data:** 2026-10-23
- **Escopo da v1:** somente **Claude Code**. A arquitetura mantém um ponto de extensão para outros agentes (Codex, Gemini CLI e outros), mas nenhum desses adapters faz parte da v1.

## 1. Objetivo e princípios

O `my-spec-kit` instala uma metodologia de Spec-Driven Development em qualquer projeto, independente da linguagem ou da stack.

1. **O conteúdo é o produto.** A CLI só copia arquivos e registra versões. Toda a inteligência fica em Markdown (templates, skills, instruções).
2. **Agnóstico de projeto e de stack.** Nada no kit cita uma tecnologia, um domínio ou um projeto específico. O que é de cada projeto mora no **steering** que o próprio projeto preenche.
3. **Skills idênticas entre projetos.** O que varia por projeto (comandos de verificação, camadas, checklist) é lido do steering, não escrito no texto das skills. Isso elimina a necessidade de um motor de templates.
4. **Uma fonte por prompt.** Cada skill existe uma vez em `core/`. Um adapter só ajusta o necessário para o agente: pasta de destino, frontmatter e arquivo de instruções.
5. **Nunca tocar no que não é do kit.** Só arquivos registrados no manifesto (ou blocos marcados) são alterados. Personalizações não são sobrescritas sem autorização.

## 2. Visão geral

```
                 ┌──────────────────────────────┐
                 │ core/  (Markdown, agnóstico) │
                 │  skills/  specs/  steering/  │
                 │  instructions/               │
                 └──────────────┬───────────────┘
                                │ lê
┌────────────┐   comando   ┌────▼─────────┐  pede destino/forma  ┌──────────────┐
│  CLI       ├────────────►│  engine      │◄────────────────────►│  adapters/   │
│ init       │             │ plano →      │                      │  claude (v1) │
│ update     │             │ confirmação →│                      │  outros (fut)│
│ doctor     │             │ aplicação    │                      └──────────────┘
│ version    │             │ manifesto    │
└────────────┘             └────┬─────────┘
                                │ escreve só arquivos gerenciados
                       ┌────────▼─────────────────────────┐
                       │ projeto de destino               │
                       │ specs/  docs/steering/  .claude/ │
                       │ CLAUDE.md (bloco)  .my-spec-kit/ │
                       └──────────────────────────────────┘
```

## 3. Fluxo de SDD

| Fase | Artefato | Skill |
| --- | --- | --- |
| 0. Steering (uma vez por projeto, atualizado quando preciso) | `docs/steering/{product,tech,structure}.md` | `/spec-steering [product\|tech\|structure] [contexto]`: a partir do contexto da pessoa (texto ou arquivos), do código, se o projeto existir, e de perguntas só sobre o que faltar |
| 1. Requisitos (o quê e por quê) | `requirements.md` | `/spec-new <feature> [descrição]`, sempre a partir de texto livre |
| 2. Design (como) | `design.md` | `/spec-design <feature>` |
| 3. Tarefas (em que passos) | `tasks.md` | `/spec-tasks <feature>` |
| 4. Implementação | código + `[x]` em `tasks.md` | `/spec-implement <feature> [nº]`, uma tarefa por vez |
| Revisão | Status `implementado` | Tarefa "Verificação final" do `tasks.md` + revisão humana do PR |
| (opcional, front) Padrões visuais | `docs/steering/style.md` | `/spec-style [o que definir]` |

- Status `rascunho` → `aprovado` → `implementado`; a aprovação é sempre humana, e nenhuma fase começa antes da aprovação da anterior.
- Requisitos em EARS (`QUANDO … ENTÃO o sistema DEVE …`), com valores concretos. Dúvidas viram perguntas, nunca suposições.
- Regras existentes nas áreas tocadas ficam em **Comportamento existente preservado** e ganham teste de regressão. Só mudam com um critério de aceite aprovado que diga isso.
- Cada tarefa cita os requisitos que atende (`_Requisitos: X.Y_`) ou as regras que preserva (`_Preserva: Pn_`), e a seção **Cobertura** mostra que nada ficou de fora.
- Se a spec estiver errada durante a implementação, a spec é corrigida primeiro.
- **Adiado:** uma skill `/spec-review <feature>` que só lê e gera o relatório de cobertura (critério/regra → teste → resultado).

## 4. Estrutura do repositório

```
my-spec-kit/
├── core/                              # conteúdo agnóstico (publicado no pacote)
│   ├── skills/
│   │   ├── spec-steering/SKILL.md
│   │   ├── spec-new/SKILL.md
│   │   ├── spec-design/SKILL.md
│   │   ├── spec-tasks/SKILL.md
│   │   ├── spec-implement/SKILL.md
│   │   └── spec-style/SKILL.md        # só para tipo front
│   ├── specs/
│   │   ├── README.md
│   │   └── _templates/
│   │       ├── tasks.md               # comum aos dois tipos
│   │       ├── api/{requirements,design}.md
│   │       └── front/{requirements,design}.md
│   ├── steering/{product,tech,structure}.md
│   └── instructions/sdd.md            # bloco inserido no arquivo de instruções do agente
├── src/
│   ├── cli/
│   │   ├── index.ts                   # entrada do bin
│   │   ├── main.ts                    # parse de argumentos, despacho e erros do usuário
│   │   ├── context.ts                 # ambiente da CLI (pasta, terminal, saída), trocado nos testes
│   │   └── commands/{init,update,doctor}.ts
│   ├── paths.ts                       # localização de core/ (igual em src/ e dist/)
│   ├── version.ts                     # versão do kit (package.json)
│   ├── errors.ts                      # UserError: mensagem sem stack
│   ├── engine/
│   │   ├── catalog.ts                 # lê core/ e monta a lista de arquivos do kit por tipo
│   │   ├── plan.ts                    # compara kit × projeto × manifesto → plano de ações
│   │   ├── apply.ts                   # executa o plano (com backup quando forçado)
│   │   ├── manifest.ts                # leitura/escrita de .my-spec-kit/manifest.json
│   │   ├── block.ts                   # inserção/atualização de bloco marcado
│   │   └── hash.ts                    # sha256 com normalização de fim de linha
│   └── adapters/
│       ├── types.ts                   # interface AgentAdapter
│       ├── claude.ts
│       └── registry.ts                # lista de adapters disponíveis
├── tests/
│   ├── core/                          # conteúdo do kit (frontmatter, seções obrigatórias)
│   ├── unit/                          # engine (plano, hash, bloco, manifesto)
│   └── cli/                           # comandos em diretórios temporários
├── docs/
│   ├── architecture.md
│   └── implementation-plan.md
├── package.json
├── tsconfig.json
└── README.md
```

**Por que `core/` fica fora de `src/`:** é conteúdo, não código. Fica legível e revisável no GitHub, e o pacote npm o publica como está, sem compilação.

## 5. O que é instalado no projeto de destino (Claude Code)

```
<projeto>/
├── CLAUDE.md                          # NÃO gerenciado; recebe só um bloco marcado
├── .claude/skills/
│   ├── spec-steering/SKILL.md         # gerenciado
│   ├── spec-new/SKILL.md              # gerenciado
│   ├── spec-design/SKILL.md           # gerenciado
│   ├── spec-tasks/SKILL.md            # gerenciado
│   ├── spec-implement/SKILL.md        # gerenciado
│   └── spec-style/SKILL.md            # gerenciado, só no tipo front
├── specs/
│   ├── README.md                      # gerenciado
│   └── _templates/*.md                # gerenciado (requirements e design na versão do tipo)
├── docs/steering/
│   ├── product.md, tech.md, structure.md   # semente (criados uma vez, depois são do projeto)
│   └── style.md                       # NÃO instalado; criado só se a pessoa chamar /spec-style
└── .my-spec-kit/manifest.json         # registro da instalação
```

As pastas de feature (`specs/NNN-*/`) **nunca** são tocadas pela CLI.

### 5.1 Tipo de projeto

O `init` pergunta (ou recebe via `--type`) se o projeto é **`api`** ou **`front`**. Front cobre web e app. O tipo muda apenas:

| | `api` | `front` |
| --- | --- | --- |
| `requirements.md` | NFRs Permissão e Paginação; erro com status HTTP | Referência visual no cabeçalho; NFRs Plataformas, Acessibilidade e Offline |
| `design.md` | Componentes por camada, Contrato da API, Dados e banco, erros por status HTTP | Telas e navegação, Componentes, Dados e estado, Integrações, Erros e estados vazios |
| Skill extra | — | `/spec-style` |

As skills de fase, o `tasks.md`, o README e o steering são os mesmos para os dois tipos. As seções da metodologia (comportamento preservado, impacto, decisões, testes, checklist) existem nos dois templates, e um teste garante isso.

### 5.2 Padrões visuais opcionais (`style.md`)

Em projetos front, a pessoa pode querer definir cores, tipografia, bordas, modo escuro etc. Isso **não é obrigatório**:

- O kit **não** instala `style.md`. Ele só passa a existir quando a pessoa chama `/spec-style [o que definir]`.
- A skill parte do que já existe no código (arquivo de tokens/tema, variáveis CSS) e pergunta só o que falta. Define apenas os temas pedidos.
- Fonte única dos valores: se houver arquivo de tokens, o `style.md` aponta para ele e guarda as regras de uso. Mudar um valor é mudar o token, não cada componente.
- O `style.md` não é importado no `CLAUDE.md`, porque o import apontaria para um arquivo que pode não existir. O bloco diz "se existir, siga-o", e `/spec-design` e `/spec-implement` o leem quando ele existe. O `style.md` não é gerenciado pelo kit; é do projeto.

### 5.3 Tipos de arquivo

| Tipo | Exemplos | `init` | `update` |
| --- | --- | --- | --- |
| **Gerenciado** | skills, `specs/README.md`, `specs/_templates/*` | Cria. Se já existir e não vier do kit, é **conflito**: não sobrescreve. | Atualiza **só se** o hash atual for igual ao registrado no manifesto (ninguém editou). Se foi editado, é conflito: pula e informa. |
| **Semente** | `docs/steering/{product,tech,structure}.md` | Cria só se não existir. | Nunca altera. |
| **Bloco** | seção SDD dentro do `CLAUDE.md` | Acrescenta o bloco ao fim (cria o arquivo se não existir). | Substitui **só o conteúdo entre os marcadores**, se o bloco não foi editado. |

Marcadores do bloco:

```markdown
<!-- my-spec-kit:start — conteúdo gerenciado pelo my-spec-kit; edite fora deste bloco -->
...
<!-- my-spec-kit:end -->
```

A versão não fica no marcador (ela está no manifesto), para o marcador não mudar a cada versão. O bloco usa o mesmo fim de linha (LF ou CRLF) que o arquivo já usa, e o texto fora dele é preservado byte a byte. Marcadores incompletos ou duplicados viram conflito, mesmo com `--force`.

**Conflitos** nunca são resolvidos em silêncio. A CLI lista cada um e a pessoa escolhe: `--force` sobrescreve, guardando uma cópia em `.my-spec-kit/backup/<data>/`, ou mantém a versão local. Templates que o projeto personalizou continuam sendo do projeto; o `update` apenas informa que existe versão nova.

### 5.4 Manifesto

`.my-spec-kit/manifest.json` (versionado no git do projeto):

```json
{
  "kitVersion": "0.1.0",
  "projectType": "api",
  "agents": ["claude"],
  "installedAt": "2026-10-23T12:00:00Z",
  "updatedAt": "2026-10-23T12:00:00Z",
  "files": {
    ".claude/skills/spec-new/SKILL.md": { "kind": "managed", "source": "skills/spec-new/SKILL.md", "sha256": "…" },
    "specs/_templates/design.md":       { "kind": "managed", "source": "specs/_templates/api/design.md", "sha256": "…" },
    "docs/steering/tech.md":            { "kind": "seed",    "source": "steering/tech.md" },
    "CLAUDE.md":                        { "kind": "block",   "source": "instructions/sdd.md", "sha256": "…" }
  }
}
```

- O hash é calculado **após normalizar CRLF → LF**. Sem isso, o `core.autocrlf` do Git no Windows marcaria todo arquivo como "editado".
- Para blocos, o hash cobre só o conteúdo entre os marcadores.

## 6. Como o que varia por projeto é tratado

| Ponto de variação | Onde mora | Como as skills usam |
| --- | --- | --- |
| Tipo de projeto | `tech.md` › **Tipo de projeto** e manifesto | Define os templates instalados. |
| Comandos de verificação (build, testes, lint) | `tech.md` › **Comandos de verificação** | `spec-implement` só marca `[x]` se todos passarem; se a seção estiver vazia, pede os comandos. |
| Arquitetura, camadas e ordem das fundações | `structure.md` | `spec-design` organiza os arquivos por camada; `spec-tasks` ordena as tarefas. |
| Checklist do design | `tech.md` › **Checklist de design** | Copiado para o "Checklist do steering" de cada `design.md`. |
| Entregas obrigatórias (ex.: script de banco, documentação da API) | `tech.md` › **Entregas obrigatórias** | Entram na verificação final do `tasks.md`. |
| Verificação manual | `tech.md` › **Verificação manual** | `spec-implement` diz como conferir a entrega. |
| Avisos ativos (restrições temporárias) | `tech.md` › **Avisos ativos** ou arquivo de instruções | `spec-design` respeita. |
| Padrões visuais (front, opcional) | `style.md` | `spec-design` e `spec-implement` seguem, se existir. |
| Política de branch e commit | arquivo de instruções do projeto | `spec-new` segue, se houver. |

## 7. Conteúdo do `core/`

### 7.1 Skills

Fonte única em `core/skills/<nome>/SKILL.md`, no formato aberto de Agent Skills (frontmatter YAML + Markdown):

```yaml
---
name: spec-new
description: Inicia uma nova spec (fase 1 — requisitos) em specs/NNN-<feature>/requirements.md a partir do template.
argument-hint: <nome-da-feature> [descrição]
disable-model-invocation: true
---
```

- `name` e `description` são os campos comuns aos agentes que suportam o padrão.
- `argument-hint` e `disable-model-invocation` são **do Claude Code**. Na v1 eles ficam diretamente na fonte, porque o único adapter é o Claude. Quando houver outro agente, o adapter dele remove ou traduz esses campos.
- O corpo usa `$ARGUMENTS`, que também é sintaxe do Claude Code e fica a cargo de futuros adapters.
- Todas as skills usam `disable-model-invocation: true`: só rodam quando a pessoa chama.

### 7.2 Templates de spec

| Template | Seções |
| --- | --- |
| `requirements.md` | Cabeçalho (Status, Spec, campo do tipo), Contexto, Fora de escopo, Requisitos (história de usuário + critérios em EARS), Comportamento existente preservado, Requisitos não funcionais do tipo, Perguntas em aberto, Decisões |
| `design.md` | Visão geral, Impacto em comportamento existente, seções do tipo (ver 5.1), Tratamento de erros, Decisões e alternativas, Estratégia de testes, Checklist do steering + Desvios justificados |
| `tasks.md` (comum) | Tarefas pequenas com rastreabilidade, bloco de regressão, Verificação final, Cobertura |

### 7.3 Steering (semente)

`product.md` (visão, módulos, usuários, glossário), `tech.md` (tipo de projeto, stack, padrões de código, comandos de verificação, verificação manual, entregas obrigatórias, checklist de design, avisos ativos) e `structure.md` (arquitetura, ordem das fundações). Todos vêm com placeholders `<completar>`, preenchidos pelo `/spec-steering`.

### 7.4 Bloco de instruções (`core/instructions/sdd.md`)

Inserido no `CLAUDE.md`: importa o steering (`@docs/steering/*.md`), descreve o fluxo e os comandos e fixa as regras gerais ("spec é a fonte da verdade", "regra existente não muda sem critério aprovado", requisitos em EARS, `style.md` se existir). Nada sobre stack ou idioma de código.

## 8. Adapters

```ts
export interface AgentAdapter {
  /** Identificador usado em --agent. */
  readonly id: string;                      // v1: 'claude'
  readonly displayName: string;
  /** Pasta onde o agente descobre skills de projeto. */
  readonly skillsDir: string;               // '.claude/skills'
  /** Arquivo de instruções que recebe o bloco SDD. */
  readonly instructionsFile: string;        // 'CLAUDE.md'
  /** Converte o SKILL.md do core para o formato do agente. */
  renderSkill(name: string, content: string): string;
  /** Converte o bloco de instruções para o formato do agente. */
  renderInstructions(content: string): string;
}
```

- **Claude (v1):** `skillsDir = .claude/skills`, `instructionsFile = CLAUDE.md`; `renderSkill` e `renderInstructions` devolvem o conteúdo sem mudança.
- Detectar automaticamente quais agentes o projeto usa fica para quando houver mais de um adapter.
- **Futuros (anotados para não fechar portas):**
  - Codex: skills em `.agents/skills/`, instruções em `AGENTS.md`, sem imports `@` (o bloco precisaria citar os caminhos em vez de importá-los); invocação só explícita via `agents/openai.yaml` com `allow_implicit_invocation: false`.
  - Gemini CLI: lê `.gemini/skills/` e também o alias `.agents/skills/`; pode carregar `AGENTS.md` via `context.fileName`.
  - Dois agentes podem compartilhar a mesma pasta de skills. Nesse caso, o engine trata o mesmo caminho de destino como um único arquivo no manifesto.
- Adicionar um agente significa criar um arquivo em `adapters/` e registrá-lo em `registry.ts`. Nem `core/` nem o engine mudam.

## 9. CLI

| Comando | Comportamento |
| --- | --- |
| `my-spec-kit init [--type api\|front] [--agent claude\|all] [--dry-run] [--yes] [--force]` | Sem `--type`: pergunta; em modo não interativo, `--type` é obrigatório. Se já houver manifesto, usa o tipo registrado e recusa trocar de tipo. Monta o plano (criar / sem mudança / conflito / já existe), mostra, pede confirmação (`--yes` pula; sem terminal, exige `--yes`) e aplica; grava o manifesto. Sem `--agent`: todos os adapters disponíveis. Agentes ainda sem adapter falham com "ainda não suportado nesta versão". `all` significa todos os adapters disponíveis (hoje, só `claude`). Rodar de novo é seguro (idempotente). |
| `my-spec-kit update [--dry-run] [--yes] [--force]` | Exige manifesto e usa o `projectType` registrado nele. Atualiza os arquivos gerenciados que não foram editados; lista os editados como conflito; acrescenta arquivos novos do kit; remove do projeto os arquivos que o kit deixou de ter, **só** se não foram editados. Sementes nunca são alteradas. |
| `my-spec-kit doctor` | Só lê. Verifica: manifesto válido; versão instalada × versão da CLI; arquivos gerenciados ausentes ou editados; bloco presente no `CLAUDE.md`; placeholders `<completar>` no steering; Status inválidos e numeração duplicada em `specs/`. Código de saída ≠ 0 quando há erro. |
| `my-spec-kit version` | Mostra a versão da CLI e, se houver manifesto, a versão instalada no projeto. |

Princípios: **plano antes de agir**, `--dry-run` em todo comando que escreve e nenhum acesso à rede.

Códigos de saída: `0` sucesso; `1` erro ou cancelamento (nada foi alterado); `2` instalação aplicada, mas sobraram conflitos.

## 10. Tecnologia

| Item | Escolha | Motivo |
| --- | --- | --- |
| Runtime | Node.js ≥ 20 (LTS) | `fs/promises`, `util.parseArgs` e `readline/promises` estáveis. |
| Linguagem | TypeScript `strict`, ESM | Tipagem do código que escreve em projetos alheios. |
| Argumentos | `node:util` `parseArgs` | Quatro comandos simples não justificam uma dependência. |
| Prompts | `node:readline/promises` | Mesmo motivo. |
| Testes | Vitest | Roda TypeScript sem passo extra; testes de CLI em diretórios temporários. |
| Dependências de runtime | **nenhuma** na v1 | Instalação rápida via `npx` e menos superfície de atualização. |

## 11. Distribuição

- **Agora:** repositório público `devbymarcos/my-spec-kit`, com instalação via `npx github:devbymarcos/my-spec-kit init`. O `package.json` tem `"prepare"`, que o npm executa ao instalar a partir do Git, de modo que `dist/` não precisa ser versionado.
- **Depois:** publicação no npm (`npx my-spec-kit init`). Em 2026-10-23 o nome estava livre. Se for registrado antes, o plano B é um nome com escopo (`@devbymarcos/my-spec-kit`), mantendo o executável `my-spec-kit`.
- `package.json` › `files`: `dist/`, `core/`, `README.md`, `LICENSE`. A versão do kit é a `version` do `package.json`, a mesma gravada no manifesto.
- Licença MIT.

## 12. Decisões

| # | Decisão | Alternativa descartada | Motivo |
| --- | --- | --- | --- |
| D1 | Fases requirements → design → tasks → implementação, com Status e aprovação humana entre elas | Fluxo sem portões de aprovação | O portão humano evita que o modelo avance sobre suposições. |
| D2 | Variações de projeto no steering, skills estáticas | Motor de templates com variáveis nas skills | As diferenças entre projetos são poucas e textuais; sem template, a skill instalada é legível e editável. |
| D3 | Manifesto com hash para detectar edição | Sobrescrever sempre / nunca atualizar | Atende "não sobrescrever personalizações" e "permitir atualizações". |
| D4 | Bloco marcado no `CLAUDE.md` | Gerenciar o arquivo inteiro / arquivo separado | O `CLAUDE.md` é do projeto. Um arquivo separado dependeria de o projeto lembrar de importá-lo. |
| D5 | Steering como semente | Steering gerenciado | O conteúdo é 100% do projeto depois de preenchido. |
| D6 | `core/` em Markdown fora de `src/` | Conteúdo embutido em strings TS | Revisável, legível no GitHub e editável sem build. |
| D7 | Só Claude Code na v1, com interface de adapter | Vários adapters já na v1 | Foco na primeira entrega; a interface garante a extensão. |
| D8 | Spec sempre a partir de texto livre; sem integração com issues nem fluxo de git | Comandos de issue e de commit | Mantém o kit focado em SDD; política de repositório é de cada projeto. |
| D9 | Zero dependências de runtime | `commander`, `inquirer` etc. | Escopo pequeno; `npx` mais rápido. |
| D10 | Hash com normalização LF | Hash binário | Evita falsos "editados" com `core.autocrlf` no Windows. |
| D11 | Tipo de projeto `api` ou `front` no `init`, escolhendo a versão de `requirements.md`/`design.md` | Template único com todas as seções opcionais | API e front pedem seções realmente diferentes; a seção certa no template é o que guia o modelo. |
| D12 | `style.md` opcional, criado só via `/spec-style` | Steering visual instalado sempre | Padrões visuais não são obrigatórios em todo projeto front. |
| D13 | Nenhuma referência a projeto, domínio ou tecnologia real no kit | Exemplos tirados de projetos reais | O kit é público e agnóstico; exemplos concretos viram placeholders. |
| D14 | `/spec-steering` parte do contexto da pessoa (texto ou arquivos) e do código, e pergunta só as lacunas das seções essenciais (as que outras skills usam), com roteiro por seção; seções que podem esperar (ex.: glossário) ficam `_A definir._`, sem cobrar resposta e sem alerta do `doctor`; aceita restringir a um arquivo | Uma skill por arquivo de steering / questionário fixo sempre completo | Um comando só mantém o fluxo simples; o contexto inicial evita perguntas já respondidas, e o roteiro garante que nenhuma seção essencial fique sem pergunta, e adiar o resto deixa o início rápido. |

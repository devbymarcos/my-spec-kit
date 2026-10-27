# Specs: Spec-Driven Development

Toda funcionalidade nasce como uma spec antes de virar código. A spec é a fonte da verdade: se o código e a spec divergirem, um dos dois está errado e precisa ser corrigido.

## Fluxo

Cada feature passa por quatro fases, sempre nesta ordem. Uma fase só começa depois que a anterior foi **revisada e aprovada** por uma pessoa.

| Fase | Arquivo | Pergunta que responde | Comando |
| --- | --- | --- | --- |
| 1. Requisitos | `requirements.md` | **O quê** e **por quê**? | `/spec-new <nome-da-feature> [descrição]` |
| 2. Design | `design.md` | **Como** vamos construir? | `/spec-design <nome-da-feature>` |
| 3. Tarefas | `tasks.md` | **Em que passos**? | `/spec-tasks <nome-da-feature>` |
| 4. Implementação | código | Executar uma tarefa por vez | `/spec-implement <nome-da-feature> [nº-da-tarefa]` |

Para aprovar uma fase, mude o **Status** do arquivo para `aprovado` (ou peça ao agente).

Antes da primeira spec, preencha o steering com `/spec-steering [contexto]`: ele parte do contexto que você passar (texto livre ou caminhos de arquivos), lê o código, se o projeto já existir, e pergunta só o que faltar.

Em projetos front, os padrões visuais (cores, tipografia, modo escuro…) são opcionais. Quando quiser defini-los, use `/spec-style`, que cria `docs/steering/style.md`. Se o arquivo existir, design e implementação passam a segui-lo.

## Estrutura

```
specs/
├── _templates/              # modelos, não editar por feature
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
└── 001-nome-da-feature/     # uma pasta por feature, numerada
    ├── requirements.md
    ├── design.md
    └── tasks.md
```

- Pastas numeradas em sequência (`001-`, `002-`…) em kebab-case.
- O campo **Status** no topo de cada arquivo indica a fase: `rascunho` → `aprovado` → `implementado`.
- O contexto global (produto, stack, estrutura e comandos de verificação) fica em [docs/steering/](../docs/steering/) e vale para todas as specs.
- As specs são versionadas: a pasta vai no commit e no PR junto com o código.

## Regras

1. Sem spec aprovada, sem código de feature (correções triviais e ajustes de infraestrutura estão dispensados).
2. Requisitos usam o formato EARS (`QUANDO … ENTÃO o sistema DEVE …`) para serem testáveis.
3. Toda tarefa em `tasks.md` referencia os requisitos que atende (ex.: `_Requisitos: 1.2, 2.1_`).
4. Regra de negócio existente só muda se um critério de aceite aprovado disser isso explicitamente. As regras atuais das áreas tocadas ficam em **Comportamento existente preservado** e ganham teste de regressão.
5. Mudou o entendimento durante a implementação? Atualize a spec primeiro, depois o código.

# Design técnico — <Nome da feature>

- **Status:** rascunho
- **Requisitos:** [requirements.md](./requirements.md)

Seção que não se aplica a esta feature: escreva "Não se aplica" em vez de apagar.

## Visão geral

<Resumo da solução em um ou dois parágrafos, cobrindo servidor e interface.>

## Impacto em comportamento existente

| Arquivo existente | O que muda | Regras preservadas | Como é garantido |
| --- | --- | --- | --- |
| `<caminho/do/arquivo>` | <...> | P1, P2 | teste de regressão `<NomeDoTeste>` |

## Componentes por camada

Camadas conforme `docs/steering/structure.md`, do servidor à interface.

| Camada | Arquivo | Novo ou existente | Responsabilidade | Requisitos |
| --- | --- | --- | --- | --- |
| <camada> | `<caminho/do/arquivo>` | novo | <...> | 1.1 |
| <camada> | `<caminho/do/arquivo>` | existente | <...> | 1.1, 1.2 |

## Contrato da API

Rotas consumidas pela interface ou expostas a terceiros.

### `<MÉTODO> /<rota>`

- **Permissão:** <...>
- **Query/rota:** <...>
- **Request:** `{ }`
- **Response <status>:** `{ }`

## Dados e banco

| Entidade | Propriedade | Tipo | Obrigatório | Observação |
| --- | --- | --- | --- | --- |
| <Entidade> | <...> | <...> | sim | <...> |

- **Migration:** <nome da migration ou "não se aplica">
- **Impacto em dados existentes:** <nenhum / ajuste de dados / ...>

## Telas e navegação

| Rota | Arquivo | Descrição | Referência visual |
| --- | --- | --- | --- |
| `/<rota>` | `<caminho/do/arquivo>` | <o que a tela faz> | <frame do protótipo / docs/design/...> |

<Fluxo de navegação entre as telas, se houver mais de uma.>

## Componentes de interface

| Componente | Local | Novo ou existente | Responsabilidade | Requisitos |
| --- | --- | --- | --- | --- |
| `<Nome>` | `<caminho/do/arquivo>` | novo | <...> | 1.1 |

## Dados e estado na interface

- **Modelos/tipos:** <tipos principais>
- **Fonte dos dados:** <rotas da API acima, renderização no servidor, armazenamento local>
- **Estado:** <local, sessão, cache>

## Tratamento de erros

| Situação | Status HTTP | O que a tela mostra | Mensagem | Requisito |
| --- | --- | --- | --- | --- |
| <validação> | 400 | <...> | "<mensagem exata>" | 1.2 |
| Carregando | — | <...> | — | <...> |
| Vazio | — | <...> | "<mensagem exata>" | <...> |

## Decisões e alternativas

| Decisão | Alternativa descartada | Motivo |
| --- | --- | --- |
| <...> | <...> | <...> |

## Estratégia de testes

| Teste | Cobre |
| --- | --- |
| `<arquivo de teste> › <nome do teste>` | 1.1 |
| `<arquivo de teste> › <nome do teste>` | P1 (regressão) |

**Verificação manual:** <conforme `docs/steering/tech.md` › Verificação manual, ou "não se aplica">

## Checklist do steering

Copie os itens de `docs/steering/tech.md` › Checklist de design e marque cada um.

- [ ] <item do checklist>
- [ ] Padrões visuais de `docs/steering/style.md` seguidos (se o arquivo existir)
- [ ] Avisos ativos do projeto respeitados

**Desvios justificados:** <nenhum>

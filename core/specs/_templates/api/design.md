# Design técnico — <Nome da feature>

- **Status:** rascunho
- **Requisitos:** [requirements.md](./requirements.md)

Seção que não se aplica a esta feature: escreva "Não se aplica" em vez de apagar.

## Visão geral

<Resumo da solução em um ou dois parágrafos.>

## Impacto em comportamento existente

| Arquivo existente | O que muda | Regras preservadas | Como é garantido |
| --- | --- | --- | --- |
| `<caminho/do/arquivo>` | <...> | P1, P2 | teste de regressão `<NomeDoTeste>` |

## Componentes por camada

Camadas conforme `docs/steering/structure.md`.

| Camada | Arquivo | Novo ou existente | Responsabilidade | Requisitos |
| --- | --- | --- | --- | --- |
| <camada> | `<caminho/do/arquivo>` | novo | <...> | 1.1 |
| <camada> | `<caminho/do/arquivo>` | existente | <...> | 1.1, 1.2 |

## Contrato da API

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

## Tratamento de erros

| Situação | Status HTTP | Mensagem | Requisito |
| --- | --- | --- | --- |
| <...> | 400 | "<mensagem exata>" | 1.2 |

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
- [ ] Avisos ativos do projeto respeitados

**Desvios justificados:** <nenhum>

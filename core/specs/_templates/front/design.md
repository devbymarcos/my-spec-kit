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

## Telas e navegação

| Rota | Arquivo | Descrição | Referência visual |
| --- | --- | --- | --- |
| `/<rota>` | `<caminho/do/arquivo>` | <o que a tela faz> | <frame do protótipo / docs/design/...> |

<Fluxo de navegação entre as telas, se houver mais de uma.>

## Componentes

| Componente | Local | Novo ou existente | Responsabilidade | Requisitos |
| --- | --- | --- | --- | --- |
| `<Nome>` | `<caminho/do/arquivo>` | novo | <...> | 1.1 |

## Dados e estado

- **Modelos/tipos:** <tipos principais>
- **Fonte dos dados:** <API, armazenamento local, mock>
- **Estado:** <local, contexto, cache de servidor>

## Integrações

<APIs consumidas, recursos nativos e permissões, configurações da plataforma.>

## Tratamento de erros e estados vazios

| Situação | O que a tela mostra | Mensagem | Requisito |
| --- | --- | --- | --- |
| Carregando | <...> | — | <...> |
| Erro | <...> | "<mensagem exata>" | <...> |
| Vazio | <...> | "<mensagem exata>" | <...> |
| Sem conexão | <...> | "<mensagem exata>" | <...> |

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

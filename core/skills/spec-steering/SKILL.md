---
name: spec-steering
description: Cria ou atualiza o steering do projeto (docs/steering/product.md, tech.md e structure.md) a partir do contexto dado pela pessoa (texto livre ou arquivos), do código, se o projeto já existir, e de perguntas sobre o que faltar.
argument-hint: [product|tech|structure] [contexto do projeto ou caminhos de arquivos]
disable-model-invocation: true
---

Crie ou atualize o **steering** do projeto: o contexto global que vale para todas as specs.

Entrada: $ARGUMENTS

1. **Interprete a entrada.**
   - Se a primeira palavra for `product`, `tech` ou `structure`, trabalhe só nesse arquivo. Sem ela, trabalhe nos três, nesta ordem: `product.md` → `tech.md` → `structure.md`.
   - O resto é o **contexto inicial** da pessoa: texto livre (o que o produto é, para quem, decisões já tomadas) e/ou caminhos de arquivos (briefing, notas, documento de requisitos, README, decisões de arquitetura). Leia cada arquivo citado. Se um caminho não existir, avise e siga com o restante.
   - Se a entrada estiver vazia e o projeto for novo, comece com **uma** pergunta aberta: "Descreva o projeto com suas palavras: o que é, para quem, e o que já está decidido (stack, arquitetura, padrões). Se tiver um documento com isso, me passe o caminho." Use a resposta como contexto inicial.
2. Leia `docs/steering/product.md`, `tech.md` e `structure.md`. Mantenha as seções que já existem nesses arquivos. Se algum já estiver preenchido (sem `<completar>`), trate como **atualização**: proponha as mudanças antes de aplicar e não apague nem reescreva conteúdo sem perguntar.
3. Siga a regra de branch do arquivo de instruções do projeto, se houver.
4. Descubra o modo e diga qual foi escolhido:
   - **Projeto existente:** há código-fonte além de documentação, specs e configuração.
   - **Projeto novo:** não há código-fonte ainda.
5. **Projeto existente: leia o código.** Leia os arquivos de dependências e build (ex.: `package.json`, `*.csproj`, `pyproject.toml`, `go.mod`), a árvore de pastas, a configuração de testes e de CI, o README, o arquivo de instruções do projeto e uma amostra do código de cada camada. Daí saem a stack com versões, os padrões de código **observados** (cite um arquivo de exemplo para cada um), os comandos de verificação que **existem** (scripts, CI), a arquitetura e a árvore de pastas. Do produto, só o que o código e o README mostram (módulos, nomes do domínio).
6. **Monte um rascunho** juntando, nesta ordem de prioridade: o contexto da pessoa, o código (se houver) e o tipo de projeto registrado em `.my-spec-kit/manifest.json`. Se o contexto da pessoa contradisser o código (ex.: cita uma biblioteca que não está nas dependências), aponte a divergência e pergunte qual vale.
7. **Pergunte só o essencial que faltar.** O roteiro abaixo separa as seções em dois grupos:
   - **Essencial:** as outras skills dependem dela. Se o contexto e o código não a responderam, pergunte com perguntas interativas (regra do arquivo de instruções), com opções sugeridas a partir do que já foi decidido, e indique no título qual seção cada pergunta preenche. Onde o roteiro diz "proponha", a proposta é a opção recomendada, e as alternativas viram as outras opções.
   - **Pode esperar:** não pergunte. Preencha só se o contexto ou o código já trouxerem a informação; se não, escreva `_A definir._` na seção. Ela vai sendo completada conforme as specs surgirem, ou quando a pessoa pedir (ex.: `/spec-steering product glossário`). Se a pessoa citar uma dessas seções na entrada, trate-a como essencial.

   Registre só o que a pessoa escolher ou escrever no campo livre.

   **`product.md`**
   | Seção | Grupo | Pergunta |
   | --- | --- | --- |
   | Visão | Essencial | O que o produto é, qual problema principal resolve e para quem? |
   | Módulos | Essencial | Quais são as grandes áreas do produto e o que cada uma cobre? Proponha a partir da visão. |
   | Usuários e clientes | Pode esperar | Quem usa: perfis de pessoas e sistemas que consomem ou integram? |
   | Glossário | Pode esperar | Que termos do domínio têm significado específico aqui? Se o contexto já usa termos do domínio, proponha as definições. |

   **`tech.md`**
   | Seção | Grupo | Pergunta |
   | --- | --- | --- |
   | Tipo de projeto | — | Não pergunte: use o do manifesto. |
   | Stack | Essencial | Linguagem, framework, banco de dados e bibliotecas principais, com versões? |
   | Padrões de código | Essencial | Proponha padrões usuais da stack escolhida (nomes, tratamento de erros, validação, testes) e peça confirmação. |
   | Comandos de verificação | Essencial | Quais comandos de build, testes e lint precisam passar antes de uma tarefa ser concluída? Proponha os padrões da stack. |
   | Verificação manual | Pode esperar | Como uma pessoa confere a entrega fora dos testes automatizados? |
   | Entregas obrigatórias | Pode esperar | Alguma mudança exige uma entrega junto (script de banco, documentação da API, changelog)? |
   | Checklist de design | Essencial | Proponha itens a partir dos padrões e da estrutura definidos e peça confirmação. |
   | Avisos ativos | — | Não pergunte: escreva `<nenhum>`, a menos que o contexto cite uma restrição temporária. |

   **`structure.md`**
   | Seção | Grupo | Pergunta |
   | --- | --- | --- |
   | Arquitetura | Essencial | Qual o estilo de arquitetura e a responsabilidade de cada camada ou área? Proponha uma, coerente com a stack. |
   | Árvore de pastas | Essencial | Em projeto novo, proponha a árvore a partir da stack e da arquitetura escolhidas e peça confirmação. |
   | Ordem das fundações | Essencial | Proponha a ordem em que uma funcionalidade costuma ser construída (ex.: modelo de dados → regras → interface), coerente com a arquitetura. |
8. Não invente. Uma seção essencial que não veio do contexto, do código nem das respostas continua como `<completar>` e entra na lista de pendências. Não copie para o steering regras de negócio detalhadas: elas pertencem às specs.
9. Escreva de forma curta e direta: o steering é carregado em toda conversa. Altere apenas `product.md`, `tech.md` e `structure.md`. Não toque em código, specs, no arquivo de instruções nem em `style.md`.
10. Termine mostrando o que foi preenchido e de onde veio cada item (contexto da pessoa, arquivo do projeto ou resposta), listando o que ficou pendente (essencial) e o que ficou para depois, e pedindo revisão. Depois da revisão, o próximo passo é `/spec-new`. Em projeto front, lembre que os padrões visuais são opcionais e podem ser definidos quando a pessoa quiser com `/spec-style`.

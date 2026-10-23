---
name: spec-steering
description: Cria ou atualiza o steering do projeto (docs/steering/product.md, tech.md e structure.md) — a partir do código, se o projeto já existir, ou com perguntas, se for novo.
argument-hint: [descrição do projeto]
disable-model-invocation: true
---

Crie ou atualize o **steering** do projeto: o contexto global que vale para todas as specs.

Entrada: $ARGUMENTS

1. Leia `docs/steering/product.md`, `tech.md` e `structure.md`. Mantenha as seções que já existem nesses arquivos. Se algum já estiver preenchido (sem `<completar>`), trate como **atualização**: proponha mudanças, mas não apague nem reescreva conteúdo sem perguntar.
2. Siga a regra de branch do arquivo de instruções do projeto, se houver.
3. Descubra o modo e diga qual foi escolhido:
   - **Projeto existente:** há código-fonte além de documentação, specs e configuração.
   - **Projeto novo:** não há código-fonte ainda.
4. **Projeto existente — a partir do código.** Leia os arquivos de dependências e build (ex.: `package.json`, `*.csproj`, `pyproject.toml`, `go.mod`), a árvore de pastas, a configuração de testes e de CI, o README, o arquivo de instruções do projeto e uma amostra do código de cada camada. Preencha:
   - `tech.md`: tipo de projeto (o registrado em `.my-spec-kit/manifest.json`); stack com versões; padrões de código **observados** (cite um arquivo de exemplo para cada um); comandos de verificação que **existem** no projeto (scripts, CI); verificação manual, se houver ferramenta para isso no repositório.
   - `structure.md`: arquitetura, árvore das pastas principais com a responsabilidade de cada uma e ordem das fundações.
   - `product.md`: só o que o código e o README mostram (módulos, nomes do domínio). Visão e usuários vêm da pessoa.
5. **Projeto novo — com a pessoa.** Faça poucas perguntas por vez, nesta ordem: o que é o produto e para quem; módulos principais; stack (o tipo de projeto já vem de `.my-spec-kit/manifest.json`); arquitetura e organização de pastas; padrões de código; comandos de build, testes e lint; como a entrega será verificada manualmente. Quando a pessoa não souber, sugira opções com os prós e contras e registre só o que ela escolher.
6. Não invente. O que não foi encontrado no código nem respondido pela pessoa continua como `<completar>` e entra na lista de perguntas. Não copie para o steering regras de negócio detalhadas; elas pertencem às specs.
7. Escreva de forma curta e direta: o steering é carregado em toda conversa. Altere apenas `product.md`, `tech.md` e `structure.md` — não toque em código, specs, no arquivo de instruções nem em `style.md`.
8. Termine mostrando o que foi preenchido e de onde veio cada item (arquivo do projeto ou resposta da pessoa), listando o que ficou pendente e pedindo revisão. Depois da revisão, o próximo passo é `/spec-new`. Em projeto front, lembre que os padrões visuais são opcionais e podem ser definidos quando a pessoa quiser com `/spec-style`.

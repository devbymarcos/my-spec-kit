---
name: spec-style
description: Cria ou atualiza os padrões visuais do front-end em docs/steering/style.md (cores, tipografia, espaçamento, bordas, dark mode, componentes). Opcional — use só quando quiser definir esses padrões.
argument-hint: [o que definir, ex.: "cores e dark mode"]
disable-model-invocation: true
---

Crie ou atualize os **padrões visuais** do projeto em `docs/steering/style.md`.

Entrada: $ARGUMENTS

1. Leia `docs/steering/*.md`. Se `style.md` já existir, trate como **atualização**: mude só o que a pessoa pediu e não apague nem reescreva conteúdo sem perguntar.
2. Siga a regra de branch do arquivo de instruções do projeto, se houver.
3. Defina **só o que a pessoa pediu**. Nada aqui é obrigatório: tema que não foi pedido fica fora do arquivo (sem `<completar>`). Se a entrada estiver vazia, pergunte o que ela quer definir (pergunta interativa de seleção múltipla com os temas do passo 7).
4. Procure o que já existe no código: arquivo de tema ou tokens, variáveis CSS, configuração do framework de estilo, biblioteca de componentes, estilos globais e suporte a modo escuro. O que já existe é a referência: registre os valores encontrados citando o arquivo de cada um.
5. Para o que ainda não existe, faça perguntas interativas (regra do arquivo de instruções), poucas por vez (ex.: cores da marca, cores neutras e de estado — sucesso, erro, aviso —, tipografia, escala de espaçamento, bordas e raios, sombras, modo escuro e como alternar, estados dos componentes — foco, erro, desabilitado —, contraste mínimo). Ofereça como opções propostas concretas, com o motivo na descrição, e registre só o que ela escolher ou escrever no campo livre.
6. **Fonte única dos valores.** Se o projeto tem um arquivo de tokens ou tema, o `style.md` aponta para ele e registra as regras de uso com o nome do token e o valor atual — mudar um valor é mudar o token, não cada componente. Se esse arquivo não existir, registre os valores no `style.md` e sugira criá-lo por uma spec (`/spec-new`).
7. Organize o `style.md` em seções apenas para os temas definidos, entre: Cores (claro e escuro), Tipografia, Espaçamento, Bordas e raios, Sombras, Modo escuro, Componentes (regras por tipo de controle), Acessibilidade e Verificação (como conferir que o código segue o padrão, ex.: busca por valores literais).
8. Altere apenas `docs/steering/style.md` — não toque em código nem em specs.
9. Termine mostrando o que foi definido e de onde veio cada item (arquivo do projeto ou resposta da pessoa), pedindo revisão. A partir daí, `/spec-design` e `/spec-implement` seguem esses padrões.

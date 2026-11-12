---
name: git
description: Prepara e faz o commit (e o push) das mudanças atuais seguindo as regras de branch e commit do projeto — lê a convenção do arquivo de instruções e do histórico, propõe a mensagem e só executa depois da confirmação.
argument-hint: [instrução, ex.: "só commit", "sem push" ou um resumo da mudança]
disable-model-invocation: true
---

Faça o **commit e o push** das mudanças atuais seguindo as regras do projeto.

Entrada: $ARGUMENTS

1. **Descubra as regras do projeto**, nesta ordem de prioridade:
   - o arquivo de instruções do projeto (regras de branch, de commit, idioma das mensagens, verificações antes do commit);
   - guias de contribuição e configurações de commit do repositório (ex.: `CONTRIBUTING.md`, configuração de lint de mensagens, modelo de mensagem, hooks);
   - o padrão dos últimos commits (`git log`), quando nada acima define a convenção.

   Se nada definir a convenção, pergunte qual usar (pergunta interativa, com Conventional Commits como opção recomendada e o padrão observado no histórico como alternativa).
2. **Leia o estado do repositório:** branch atual, upstream, `git status`, as mudanças preparadas e as não preparadas (`git diff --staged` e `git diff`). Se não houver mudanças, diga isso e pare.
3. **Branch.** Nunca faça commit na branch principal (ex.: `main`, `master`), a menos que o arquivo de instruções permita explicitamente; o mesmo vale para outra branch que a regra do projeto proíba. Nesse caso, proponha o nome de uma branch nova conforme a regra (ou a partir da spec ou da mudança) e só crie depois da confirmação; as mudanças vão junto para ela.
4. **Confira antes do commit:**
   - arquivos que não devem ir para o repositório (segredos, chaves, `.env`, credenciais, artefatos de build, arquivos grandes ou temporários): não inclua e avise;
   - **não rode testes, build nem lint**: o commit e o push só salvam o trabalho em andamento. A verificação roda ao fim da feature, na tarefa de verificação final do `tasks.md`. Nunca pule hooks (`--no-verify`); se um hook rodar verificações, deixe-o rodar.
5. **Agrupe.** Se as mudanças tratam de assuntos diferentes, proponha dividi-las em commits separados, um por assunto, listando os arquivos de cada um.
6. **Escreva a mensagem** de cada commit na convenção do projeto, descrevendo o porquê da mudança e não só o que mudou. Se as mudanças pertencem a uma spec em `specs/` cujo cabeçalho tem **Issue**, referencie a issue do jeito que a convenção do projeto pede. Use a instrução da entrada, se houver.
7. **Confirme** com uma pergunta interativa (regra do arquivo de instruções), mostrando a branch, os arquivos e a mensagem de cada commit. Opções: "Commit e push (Recomendado)", "Só commit" e "Cancelar". A mensagem pode ser ajustada no campo livre. Se a entrada pediu "só commit" ou "sem push", não ofereça o push.
8. **Execute** depois da confirmação:
   - adicione só os arquivos do commit, pelo nome (nada de adicionar tudo às cegas);
   - faça o commit. Se um hook falhar, corrija o problema e faça um commit novo; não use `--amend` sem pedido;
   - push para o upstream da branch; se a branch ainda não tiver upstream, publique-a com upstream no remoto padrão. Nunca use push forçado sem pedido explícito.
9. Termine mostrando o hash e a mensagem de cada commit, a branch e o resultado do push. Se a branch é nova, lembre que o próximo passo pode ser abrir um PR, conforme o fluxo do projeto.

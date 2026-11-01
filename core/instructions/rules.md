## Regras do projeto

Contexto global do projeto (steering), carregado junto com este arquivo:
- Produto: @docs/steering/product.md
- Stack, padrões de código e comandos de verificação: @docs/steering/tech.md
- Estrutura do projeto: @docs/steering/structure.md

O `docs/steering/` é a fonte das regras do projeto. Ele pode ter sido escrito antes do kit, com outros títulos ou outra organização: use o que está escrito, procurando cada informação pelo conteúdo, não pelo título da seção (ex.: os comandos de teste numa seção "Testes"). Outros arquivos de `docs/steering/` também são regras do projeto: leia os que tratam da área de cada tarefa.

O projeto pode ter sido conduzido antes com outro agente de IA. Nesse caso:
- **Arquivos de instruções de outros agentes** na raiz (ex.: `CLAUDE.md`, `GEMINI.md`): as regras de projeto escritas neles fora do bloco do kit (branch, commit, convenções do time) também valem. Leia-os no início do trabalho. Se contradisserem este arquivo ou o steering, pergunte qual vale. Ignore o que só faz sentido no outro agente (comandos e ferramentas dele).
- **Specs em `specs/NNN-<feature>/`**: são a fonte da verdade da funcionalidade. Antes de mudar uma área que tem spec, leia `requirements.md` e `design.md` dela e siga-os; se o pedido contradisser a spec, aponte a divergência antes de implementar. Não altere o Status de uma spec sem pedido.

Siga o steering em todo trabalho:
- **Estrutura:** cada arquivo novo vai para a camada e a pasta indicadas em `structure.md`. Funcionalidades são construídas na ordem das fundações descrita lá.
- **Código:** siga a stack e os padrões de código de `tech.md` e os padrões que já existem no código. Antes de acrescentar uma dependência que não está na stack, pergunte.
- **Verificação:** uma tarefa só está concluída quando todos os comandos de verificação de `tech.md` passam. Se a seção estiver vazia, pergunte quais são. Inclua as entregas obrigatórias e diga como fazer a verificação manual.
- **Checklist e avisos:** toda solução técnica atende ao checklist de design e respeita os avisos ativos de `tech.md`. Se precisar fugir de um item, diga qual e por quê antes de implementar.
- **Padrões visuais (opcional, só em front):** se existir `docs/steering/style.md`, siga-o em qualquer mudança visual.
- **Regras de negócio existentes não podem ser alteradas** sem que a pessoa peça isso explicitamente. Se uma mudança afetar uma regra existente, aponte antes de implementar.
- Dúvidas de regra de negócio são perguntadas, nunca assumidas.
- **Steering incompleto:** se algum arquivo de `docs/steering/` ainda tiver `<completar>`, ou se faltar de fato uma informação que a tarefa exige (ex.: nenhum comando de verificação em lugar nenhum), avise a pessoa e ofereça completá-lo, seguindo o roteiro de preenchimento do steering. Não preencha o steering por suposição e não reescreva o que já está definido.
- **Perguntas:** sempre que precisar perguntar algo à pessoa, use a ferramenta de perguntas do agente, se houver. Sem ela, liste as perguntas numeradas (até 4 por vez), cada uma com 2 a 4 opções sugeridas, tiradas do contexto, do código ou de práticas usuais, a recomendada primeiro com "(Recomendado)", e diga que a pessoa pode responder com outra coisa. Só pergunte por texto livre quando não houver sugestão razoável.

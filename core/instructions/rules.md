## Regras do projeto

Contexto global do projeto (steering), carregado junto com este arquivo:
- Produto: @docs/steering/product.md
- Stack, padrões de código e comandos de verificação: @docs/steering/tech.md
- Estrutura do projeto: @docs/steering/structure.md

As regras do projeto vêm só deste arquivo e do `docs/steering/`. Arquivos de outros agentes de IA que existirem no projeto (ex.: `CLAUDE.md`, `specs/`) não se aplicam a você. O steering pode ter sido escrito antes do kit, com outros títulos ou outra organização: procure cada informação pelo conteúdo, não pelo título da seção. Outros arquivos de `docs/steering/` também são regras do projeto: leia os que tratam da área de cada tarefa.

**Como trabalhar**
- **Planeje antes de mudar.** Toda mudança que não for trivial começa por um plano de implementação, revisado pela pessoa antes de qualquer arquivo ser alterado. O plano cobre:
  - o que muda e o que fica fora do pedido;
  - os arquivos envolvidos, organizados pelas camadas de `structure.md`;
  - o impacto em comportamento e regras de negócio que já existem;
  - os testes: novos e de regressão do que não pode mudar;
  - os itens do checklist de design de `tech.md` e qualquer desvio, com o motivo.
- **Faça só o que foi pedido.** Sem dependências que não estão na stack, refatorações fora do escopo, arquivos ou documentação extras. Se algo assim parecer necessário, pergunte antes.
- **Verifique antes de concluir.** A tarefa só está concluída quando todos os comandos de verificação de `tech.md` passam. Se a seção estiver vazia, pergunte quais são. Inclua as entregas obrigatórias.
- **Feche com um resumo:** o que foi feito, os comandos rodados e o resultado, e como a pessoa confere a entrega (verificação manual de `tech.md`).

**Regras do projeto**
- **Estrutura:** cada arquivo novo vai para a camada e a pasta indicadas em `structure.md`, e as funcionalidades são construídas na ordem das fundações descrita lá.
- **Código:** siga a stack e os padrões de código de `tech.md` e os padrões que já existem no código.
- **Avisos ativos** de `tech.md` valem até serem removidos.
- **Padrões visuais (opcional, só em front):** se existir `docs/steering/style.md`, siga-o em qualquer mudança visual.
- **Regras de negócio existentes não podem ser alteradas** sem que a pessoa peça isso explicitamente. Se uma mudança afetar uma regra existente, aponte antes de implementar.
- Dúvidas de regra de negócio são perguntadas, nunca assumidas.
- **Steering incompleto:** se algum arquivo de `docs/steering/` ainda tiver `<completar>`, ou se faltar de fato uma informação que a tarefa exige (ex.: nenhum comando de verificação em lugar nenhum), avise a pessoa e ofereça completá-lo com a skill de steering. Não preencha o steering por suposição e não reescreva o que já está definido.
- **Perguntas:** sempre que precisar perguntar algo à pessoa, use a ferramenta de perguntas do agente, se houver. Sem ela, liste as perguntas numeradas (até 4 por vez), cada uma com 2 a 4 opções sugeridas, tiradas do contexto, do código ou de práticas usuais, a recomendada primeiro com "(Recomendado)", e diga que a pessoa pode responder com outra coisa. Só pergunte por texto livre quando não houver sugestão razoável.

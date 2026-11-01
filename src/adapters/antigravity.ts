import { parseSkill, replaceOnce } from './text.js';
import type { AgentAdapter } from './types.js';

// No Antigravity o kit instala as regras do projeto e o steering; o planejamento fica com o ciclo
// nativo do agente (plano revisado antes de mudar). A única skill é a de steering, sem o fluxo de specs.
export const antigravityAdapter: AgentAdapter = {
  id: 'antigravity',
  displayName: 'Antigravity',
  instructionsFile: 'AGENTS.md',
  instructionsSource: 'instructions/rules.md',
  skills: ['spec-steering'],
  specs: false,
  steeringHint: 'peça "preencha o steering do projeto"',
  skillTarget: (name, file) => `.agents/skills/${name}/${file}`,
  renderSkill: toSkill,
  // `@caminho` só cita o arquivo no Antigravity; `@[rótulo](caminho)` carrega o conteúdo.
  renderInstructions: (content) =>
    content.replace(/(?<=\s)@([\w./-]+\.md)/g, (_m, path: string) => `@[${path.split('/').pop()}](${path})`),
};

// O agente escolhe a skill pela descrição, então ela diz quando usar.
const STEERING_DESCRIPTION =
  'Cria ou atualiza o steering do projeto (docs/steering/product.md, tech.md e structure.md) a partir do' +
  ' contexto da pessoa, do código e de perguntas sobre o que faltar. Use quando a pessoa pedir para' +
  ' preencher, revisar ou atualizar o steering ou esses arquivos, ou quando eles ainda tiverem <completar>.';

/** Trechos da skill que citam comandos ou specs, que não existem no Antigravity. */
const STEERING_EDITS: ReadonlyArray<readonly [string, string]> = [
  ['o contexto global que vale para todas as specs.', 'o contexto global que vale para todo trabalho no projeto.'],
  ['Entrada: $ARGUMENTS', 'Entrada: o pedido da pessoa nesta conversa (o que preencher e o contexto que ela passou).'],
  ['**Essencial:** as outras skills dependem dela.', '**Essencial:** as regras do projeto dependem dela.'],
  ['(ex.: `/spec-steering product glossário`)', '(ex.: "complete o glossário do product.md")'],
  ['elas pertencem às specs.', 'elas pertencem ao código e à documentação de cada funcionalidade.'],
  [
    ' Depois da revisão, o próximo passo é `/spec-new`. Em projeto front, lembre que os padrões visuais são opcionais e podem ser definidos quando a pessoa quiser com `/spec-style`.',
    ' Em projeto front, lembre que os padrões visuais são opcionais e ficam em `docs/steering/style.md`, se a pessoa quiser defini-los.',
  ],
];

/** Converte o `SKILL.md` de steering para o Antigravity: só `name` e `description`, sem citar comandos. */
function toSkill(name: string, content: string): string {
  if (name !== 'spec-steering') throw new Error(`O Antigravity não tem conversão para a skill "${name}".`);

  const body = STEERING_EDITS.reduce(
    (text, [search, replacement]) => replaceOnce(text, search, replacement),
    parseSkill(name, content).body,
  );
  return `---\nname: ${name}\ndescription: ${JSON.stringify(STEERING_DESCRIPTION)}\n---\n\n${body}`;
}

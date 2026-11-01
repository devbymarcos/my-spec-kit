import { parseSkill, replaceOnce } from './text.js';
import type { AgentAdapter } from './types.js';

// No Antigravity o kit instala só as regras do projeto, sem o fluxo de specs nem comandos.
// O roteiro de preenchimento do steering vira uma regra que o agente carrega quando o pedido combina.
export const antigravityAdapter: AgentAdapter = {
  id: 'antigravity',
  displayName: 'Antigravity',
  instructionsFile: 'AGENTS.md',
  instructionsSource: 'instructions/rules.md',
  skills: ['spec-steering'],
  specs: false,
  steeringHint: 'peça "preencha o steering do projeto"',
  skillTarget: (name, file) =>
    file === 'SKILL.md' ? `.agents/rules/${name}.md` : `.agents/rules/${name}/${file}`,
  renderSkill: toRule,
  // `@caminho` só cita o arquivo no Antigravity; `@[rótulo](caminho)` carrega o conteúdo.
  renderInstructions: (content) =>
    content.replace(/(?<=\s)@([\w./-]+\.md)/g, (_m, path: string) => `@[${path.split('/').pop()}](${path})`),
};

const RULE_DESCRIPTION =
  'Roteiro para criar ou atualizar o steering do projeto (docs/steering/product.md, tech.md e structure.md).' +
  ' Use quando a pessoa pedir para preencher ou atualizar o steering ou esses arquivos,' +
  ' ou quando eles ainda tiverem <completar>.';

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

/** Converte o `SKILL.md` de steering numa regra ativada pelo modelo. */
function toRule(name: string, content: string): string {
  if (name !== 'spec-steering') throw new Error(`O Antigravity não tem conversão para a skill "${name}".`);

  const body = STEERING_EDITS.reduce((text, [search, replacement]) => replaceOnce(text, search, replacement), parseSkill(name, content).body);
  return `---\ntrigger: model_decision\ndescription: ${JSON.stringify(RULE_DESCRIPTION)}\n---\n\n${body}`;
}

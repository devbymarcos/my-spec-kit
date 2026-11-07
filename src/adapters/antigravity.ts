import { parseSkill, replaceOnce } from './text.js';
import type { AgentAdapter } from './types.js';

export const antigravityAdapter: AgentAdapter = {
  id: 'antigravity',
  displayName: 'Antigravity',
  instructionsFile: 'AGENTS.md',
  instructionsSource: 'instructions/sdd.md',
  specs: true,
  steeringHint: 'rode /spec-steering',
  skillTarget: (name, file) => `.agents/skills/${name}/${file}`,
  renderSkill: toSkill,
  renderInstructions: (content) =>
    replaceOnce(content, '(no Claude Code, `AskUserQuestion`)', '(no Antigravity, `ask_question`)')
      .replace(/(?<=\s)@([\w./-]+\.md)/g, (_m, path: string) => `@[${path.split('/').pop()}](${path})`),
};

/** Converte o `SKILL.md` para o formato de Agent Skills do Antigravity. */
function toSkill(name: string, content: string): string {
  const { fields, body } = parseSkill(name, content);
  const hint = fields.get('argument-hint');
  const desc = fields.get('description') ?? name;
  const description = hint ? `${desc} Uso: /${name} ${hint}` : desc;
  return `---\nname: ${name}\ndescription: ${JSON.stringify(description)}\n---\n\n${body}`;
}

import type { AgentAdapter } from './types.js';

// O core já é escrito no formato do Claude Code, então nada é convertido.
export const claudeAdapter: AgentAdapter = {
  id: 'claude',
  displayName: 'Claude Code',
  instructionsFile: 'CLAUDE.md',
  instructionsSource: 'instructions/sdd.md',
  specs: true,
  steeringHint: 'rode /spec-steering',
  skillTarget: (name, file) => `.claude/skills/${name}/${file}`,
  renderSkill: (_name, content) => content,
  renderInstructions: (content) => content,
};

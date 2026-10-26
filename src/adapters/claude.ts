import type { AgentAdapter } from './types.js';

// O core já é escrito no formato do Claude Code, então nada é convertido.
export const claudeAdapter: AgentAdapter = {
  id: 'claude',
  displayName: 'Claude Code',
  skillsDir: '.claude/skills',
  instructionsFile: 'CLAUDE.md',
  renderSkill: (_name, content) => content,
  renderInstructions: (content) => content,
};

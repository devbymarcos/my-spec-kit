import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { antigravityAdapter } from '../../src/adapters/antigravity.js';
import { normalizeEol } from '../../src/engine/hash.js';
import { CORE_DIR } from '../../src/paths.js';

const skills = readdirSync(join(CORE_DIR, 'skills'));
const readCore = (path: string) => normalizeEol(readFileSync(join(CORE_DIR, path), 'utf8'));

/** Lê a skill renderizada para o Antigravity. */
function parseAntigravitySkill(content: string): { name: string; description: string; body: string } {
  const match = /^---\nname:\s*(.+)\ndescription:\s*(".*")\n---\n\n([\s\S]*)$/.exec(content);
  if (!match) throw new Error(`skill fora do formato esperado:\n${content}`);
  return { name: match[1]!, description: JSON.parse(match[2]!) as string, body: match[3]! };
}

describe('antigravityAdapter', () => {
  it('installs skills under .agents/skills/', () => {
    expect(antigravityAdapter.skillTarget('spec-new', 'SKILL.md')).toBe('.agents/skills/spec-new/SKILL.md');
    expect(antigravityAdapter.instructionsFile).toBe('AGENTS.md');
    expect(antigravityAdapter.specs).toBe(true);
  });

  it.each(skills)('renders skill %s with clean frontmatter and hint', (skill) => {
    const rendered = antigravityAdapter.renderSkill(skill, readCore(`skills/${skill}/SKILL.md`));
    const { name, description, body } = parseAntigravitySkill(rendered);

    expect(name).toBe(skill);
    expect(description).toBeTruthy();
    expect(body).not.toMatch(/^---/);
  });

  it('points the questions rule to ask_question and converts steering includes to Antigravity format', () => {
    const block = antigravityAdapter.renderInstructions(readCore('instructions/sdd.md'));

    expect(block).toContain('`ask_question`');
    expect(block).not.toContain('AskUserQuestion');
    expect(block).toContain('@[product.md](docs/steering/product.md)');
    expect(block).toContain('@[tech.md](docs/steering/tech.md)');
    expect(block).toContain('@[structure.md](docs/steering/structure.md)');
    expect(block).not.toMatch(/(?<=\s)@docs\/steering/);
  });
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { antigravityAdapter } from '../../src/adapters/antigravity.js';
import { normalizeEol } from '../../src/engine/hash.js';
import { CORE_DIR } from '../../src/paths.js';

const readCore = (path: string) => normalizeEol(readFileSync(join(CORE_DIR, path), 'utf8'));

describe('antigravityAdapter', () => {
  it('installs only the steering skill and nothing of the specs flow', () => {
    expect(antigravityAdapter.skills).toEqual(['spec-steering']);
    expect(antigravityAdapter.specs).toBe(false);
    expect(antigravityAdapter.skillTarget('spec-steering', 'SKILL.md')).toBe('.agents/skills/spec-steering/SKILL.md');
  });

  it('renders the steering skill with name and description only, without commands', () => {
    const skill = antigravityAdapter.renderSkill('spec-steering', readCore('skills/spec-steering/SKILL.md'));
    const [, frontmatter, body] = /^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/.exec(skill) ?? [];

    expect(frontmatter!.split('\n').map((l) => l.split(':')[0])).toEqual(['name', 'description']);
    expect(frontmatter).toMatch(/^name: spec-steering$/m);
    expect(frontmatter).toMatch(/^description: ".*Use quando.+"$/m);
    expect(body).toContain('docs/steering/product.md');
    // O Antigravity não tem os comandos do kit nem $ARGUMENTS.
    expect(body).not.toMatch(/\/spec-|\$ARGUMENTS/);
  });

  it('imports the steering with the syntax that loads the content', () => {
    const block = antigravityAdapter.renderInstructions(readCore('instructions/rules.md'));

    expect(block).toContain('@[product.md](docs/steering/product.md)');
    expect(block).toContain('@[tech.md](docs/steering/tech.md)');
    expect(block).toContain('@[structure.md](docs/steering/structure.md)');
    expect(block).not.toMatch(/\s@docs\//);
  });

  it('plans with review instead of the specs flow and ignores other agents files', () => {
    const block = antigravityAdapter.renderInstructions(readCore('instructions/rules.md'));

    expect(block).toContain('**Planeje antes de mudar.**');
    expect(block).toContain('**Faça só o que foi pedido.**');
    expect(block).toContain('não se aplicam a você');
    expect(block).not.toMatch(/\/spec-|requirements\.md|tasks\.md/);
  });
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { antigravityAdapter } from '../../src/adapters/antigravity.js';
import { normalizeEol } from '../../src/engine/hash.js';
import { CORE_DIR } from '../../src/paths.js';

const readCore = (path: string) => normalizeEol(readFileSync(join(CORE_DIR, path), 'utf8'));

describe('antigravityAdapter', () => {
  it('installs the steering guide as a rule and nothing of the specs flow', () => {
    expect(antigravityAdapter.skills).toEqual(['spec-steering']);
    expect(antigravityAdapter.specs).toBe(false);
    expect(antigravityAdapter.skillTarget('spec-steering', 'SKILL.md')).toBe('.agents/rules/spec-steering.md');
  });

  it('renders the steering skill as a model-decision rule without commands', () => {
    const rule = antigravityAdapter.renderSkill('spec-steering', readCore('skills/spec-steering/SKILL.md'));
    const [, frontmatter, body] = /^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/.exec(rule) ?? [];

    expect(frontmatter).toMatch(/^trigger: model_decision$/m);
    expect(frontmatter).toMatch(/^description: ".+"$/m);
    expect(body).toContain('docs/steering/product.md');
    // O Antigravity não tem os comandos do kit nem $ARGUMENTS.
    expect(body).not.toMatch(/\/spec-|\$ARGUMENTS|disable-model-invocation/);
  });

  it('imports the steering with the syntax that loads the content', () => {
    const block = antigravityAdapter.renderInstructions(readCore('instructions/rules.md'));

    expect(block).toContain('@[product.md](docs/steering/product.md)');
    expect(block).toContain('@[tech.md](docs/steering/tech.md)');
    expect(block).toContain('@[structure.md](docs/steering/structure.md)');
    expect(block).not.toMatch(/\s@docs\//);
    expect(block).not.toMatch(/\/spec-/);
  });
});

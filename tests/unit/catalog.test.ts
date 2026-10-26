import { describe, expect, it } from 'vitest';
import { claudeAdapter } from '../../src/adapters/claude.js';
import { buildCatalog } from '../../src/engine/catalog.js';
import { CORE_DIR } from '../../src/paths.js';

describe('buildCatalog', () => {
  it('installs the api templates and no spec-style for api projects', async () => {
    const catalog = await buildCatalog(CORE_DIR, 'api', [claudeAdapter]);
    const targets = catalog.map((e) => e.target);

    expect(targets).not.toContain('.claude/skills/spec-style/SKILL.md');
    expect(targets).toContain('.claude/skills/spec-new/SKILL.md');
    expect(byTarget(catalog, 'specs/_templates/design.md').source).toBe('specs/_templates/api/design.md');
    expect(byTarget(catalog, 'specs/_templates/requirements.md').source).toBe('specs/_templates/api/requirements.md');
    expect(byTarget(catalog, 'specs/_templates/tasks.md').source).toBe('specs/_templates/tasks.md');
  });

  it('installs the front templates and spec-style for front projects', async () => {
    const catalog = await buildCatalog(CORE_DIR, 'front', [claudeAdapter]);

    expect(byTarget(catalog, '.claude/skills/spec-style/SKILL.md').kind).toBe('managed');
    expect(byTarget(catalog, 'specs/_templates/design.md').source).toBe('specs/_templates/front/design.md');
  });

  it('marks steering as seed and the instructions file as block', async () => {
    const catalog = await buildCatalog(CORE_DIR, 'api', [claudeAdapter]);

    expect(byTarget(catalog, 'docs/steering/tech.md').kind).toBe('seed');
    expect(byTarget(catalog, 'CLAUDE.md')).toMatchObject({ kind: 'block', source: 'instructions/sdd.md' });
    expect(catalog.some((e) => e.target.startsWith('docs/steering/style'))).toBe(false);
  });

  it('never targets a type subfolder of the templates', async () => {
    const catalog = await buildCatalog(CORE_DIR, 'front', [claudeAdapter]);

    expect(catalog.filter((e) => /specs\/_templates\/(api|front)\//.test(e.target))).toEqual([]);
  });
});

function byTarget<T extends { target: string }>(list: T[], target: string): T {
  const found = list.find((e) => e.target === target);
  if (!found) throw new Error(`missing ${target}`);
  return found;
}

import { describe, expect, it } from 'vitest';
import { BLOCK_END, BLOCK_START } from '../../src/engine/block.js';
import { hashContent } from '../../src/engine/hash.js';
import type { Manifest } from '../../src/engine/manifest.js';
import { buildManifest, manifestChanged, planInstall, type PlanAction } from '../../src/engine/plan.js';
import type { CatalogEntry } from '../../src/engine/types.js';

const managed = (target: string, content: string): CatalogEntry => ({ target, source: target, kind: 'managed', content });
const seed = (target: string, content: string): CatalogEntry => ({ target, source: target, kind: 'seed', content });
const block = (target: string, content: string): CatalogEntry => ({ target, source: 'instructions/sdd.md', kind: 'block', content });

function manifestWith(files: Manifest['files']): Manifest {
  return { kitVersion: '0.0.1', projectType: 'api', agents: ['claude'], installedAt: 'x', updatedAt: 'x', files };
}

function single(entry: CatalogEntry, current?: string, manifest?: Manifest, force = false): PlanAction {
  const map = new Map(current === undefined ? [] : [[entry.target, current]]);
  const [action] = planInstall({ catalog: [entry], current: map, manifest, force });
  if (!action) throw new Error('no action');
  return action;
}

describe('planInstall — managed files', () => {
  const entry = managed('a.md', 'novo\n');

  it('creates a missing file', () => {
    expect(single(entry)).toMatchObject({ type: 'create', content: 'novo\n', hash: hashContent('novo\n') });
  });

  it('adopts an existing file with the same content', () => {
    expect(single(entry, 'novo\r\n').type).toBe('unchanged');
  });

  it('reports a conflict for a different file not installed by the kit', () => {
    expect(single(entry, 'do projeto\n')).toMatchObject({ type: 'conflict', reason: 'já existe e não foi instalado pelo kit' });
  });

  it('updates a file nobody edited since installation', () => {
    const manifest = manifestWith({ 'a.md': { kind: 'managed', source: 'a.md', sha256: hashContent('antigo\n') } });

    expect(single(entry, 'antigo\n', manifest)).toMatchObject({ type: 'update', content: 'novo\n' });
  });

  it('reports a conflict for a file edited since installation', () => {
    const manifest = manifestWith({ 'a.md': { kind: 'managed', source: 'a.md', sha256: hashContent('antigo\n') } });

    expect(single(entry, 'editado\n', manifest)).toMatchObject({ type: 'conflict', reason: 'editado desde a instalação' });
  });

  it('overwrites a conflict with backup only when forced', () => {
    expect(single(entry, 'editado\n', undefined, true)).toMatchObject({ type: 'update', backup: true });
  });
});

describe('planInstall — seeds', () => {
  it('creates a missing seed and never touches an existing one', () => {
    expect(single(seed('s.md', 'x')).type).toBe('create');
    expect(single(seed('s.md', 'x'), 'preenchido').type).toBe('skip-seed');
    expect(single(seed('s.md', 'x'), 'preenchido', undefined, true).type).toBe('skip-seed');
  });
});

describe('planInstall — block', () => {
  const entry = block('CLAUDE.md', 'regras novas\n');
  const fileWith = (inner: string) => `# Projeto\n\n${BLOCK_START}\n${inner}\n${BLOCK_END}\n`;

  it('creates the instructions file when missing', () => {
    expect(single(entry)).toMatchObject({ type: 'create', content: `${BLOCK_START}\nregras novas\n${BLOCK_END}\n` });
  });

  it('appends the block to an existing file', () => {
    const action = single(entry, '# Projeto\n');

    expect(action.type).toBe('create');
    expect(action.content?.startsWith('# Projeto\n')).toBe(true);
  });

  it('keeps an identical block unchanged', () => {
    expect(single(entry, fileWith('regras novas')).type).toBe('unchanged');
  });

  it('updates a block nobody edited', () => {
    const manifest = manifestWith({ 'CLAUDE.md': { kind: 'block', source: 'x', sha256: hashContent('regras antigas') } });

    const action = single(entry, fileWith('regras antigas'), manifest);

    expect(action.type).toBe('update');
    expect(action.content).toBe(fileWith('regras novas'));
  });

  it('reports a conflict for an edited block and for broken markers', () => {
    const manifest = manifestWith({ 'CLAUDE.md': { kind: 'block', source: 'x', sha256: hashContent('regras antigas') } });

    expect(single(entry, fileWith('editado à mão'), manifest).type).toBe('conflict');
    expect(single(entry, `${BLOCK_START}\nsem fim`, manifest, true).type).toBe('conflict');
  });
});

describe('planInstall — files removed from the kit', () => {
  const manifest = manifestWith({ 'old.md': { kind: 'managed', source: 'old.md', sha256: hashContent('velho') } });
  const plan = (current: string | undefined, force = false) =>
    planInstall({ catalog: [], current: new Map(current === undefined ? [] : [['old.md', current]]), manifest, force });

  it('removes an unedited file', () => {
    expect(plan('velho')).toMatchObject([{ type: 'remove', target: 'old.md', orphan: true }]);
  });

  it('keeps an edited file as conflict unless forced', () => {
    expect(plan('editado')).toMatchObject([{ type: 'conflict' }]);
    expect(plan('editado', true)).toMatchObject([{ type: 'remove', backup: true }]);
  });

  it('ignores a file that is already gone', () => {
    expect(plan(undefined)).toEqual([]);
  });
});

describe('buildManifest', () => {
  const meta = { kitVersion: '0.2.0', projectType: 'api' as const, agents: ['claude'], now: 'agora' };

  it('records installed files, keeps edited ones and drops removed ones', () => {
    const previous = manifestWith({
      'edited.md': { kind: 'managed', source: 'edited.md', sha256: 'h-antigo' },
      'old.md': { kind: 'managed', source: 'old.md', sha256: 'h-old' },
    });
    const actions: PlanAction[] = [
      { type: 'create', target: 'b.md', kind: 'managed', source: 'b.md', hash: 'h-b', content: '' },
      { type: 'skip-seed', target: 's.md', kind: 'seed', source: 's.md' },
      { type: 'conflict', target: 'edited.md', kind: 'managed', source: 'edited.md' },
      { type: 'remove', target: 'old.md', kind: 'managed', source: 'old.md', orphan: true },
    ];

    const manifest = buildManifest(actions, previous, meta);

    expect(manifest.files).toEqual({
      'b.md': { kind: 'managed', source: 'b.md', sha256: 'h-b' },
      'edited.md': { kind: 'managed', source: 'edited.md', sha256: 'h-antigo' },
      's.md': { kind: 'seed', source: 's.md' },
    });
    expect(manifest).toMatchObject({ kitVersion: '0.2.0', installedAt: 'x', updatedAt: 'agora' });
  });

  it('does not register a conflicting file the kit never installed', () => {
    const actions: PlanAction[] = [{ type: 'conflict', target: 'theirs.md', kind: 'managed', source: 'theirs.md' }];

    expect(buildManifest(actions, undefined, meta).files).toEqual({});
  });

  it('detects changes ignoring dates', () => {
    const a = manifestWith({});

    expect(manifestChanged({ ...a, updatedAt: 'outra' }, a)).toBe(false);
    expect(manifestChanged({ ...a, kitVersion: '9' }, a)).toBe(true);
    expect(manifestChanged(a, undefined)).toBe(true);
  });
});

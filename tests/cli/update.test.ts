import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { run } from '../../src/cli/main.js';
import type { CliContext } from '../../src/cli/context.js';
import { BLOCK_END, BLOCK_START } from '../../src/engine/block.js';
import { hashContent } from '../../src/engine/hash.js';
import type { Manifest } from '../../src/engine/manifest.js';
import { CORE_DIR } from '../../src/paths.js';
import { KIT_VERSION } from '../../src/version.js';

let root: string;
/** Cópia do core/ que simula a próxima versão do kit. */
let nextCore: string;
let output: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'my-spec-kit-'));
  nextCore = await mkdtemp(join(tmpdir(), 'my-spec-kit-core-'));
  await cp(CORE_DIR, nextCore, { recursive: true });
  output = '';
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
  await rm(nextCore, { recursive: true, force: true });
});

function ctx(overrides: Partial<CliContext> = {}): Partial<CliContext> {
  return {
    cwd: root,
    interactive: false,
    out: (text) => void (output += text),
    err: (text) => void (output += text),
    now: () => new Date('2026-10-26T12:00:00Z'),
    ask: async () => {
      throw new Error('unexpected question');
    },
    ...overrides,
  };
}

const init = (args: string[]) => run(['init', ...args], ctx());

const update = (args: string[], overrides?: Partial<CliContext>) =>
  run(['update', ...args], ctx({ coreDir: nextCore, now: () => new Date('2026-11-01T09:00:00Z'), ...overrides }));

async function put(path: string, content: string, base = root) {
  await mkdir(dirname(join(base, path)), { recursive: true });
  await writeFile(join(base, path), content, 'utf8');
}

const read = (path: string) => readFile(join(root, path), 'utf8');

/** Caminho → hash de todos os arquivos do projeto, para comparar antes e depois. */
async function snapshot(dir = root): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) Object.assign(result, await snapshot(path));
    else result[relative(root, path).split(sep).join('/')] = hashContent(await readFile(path, 'utf8'));
  }
  return result;
}

async function manifest(): Promise<Manifest> {
  return JSON.parse(await read('.my-spec-kit/manifest.json')) as Manifest;
}

/** Muda um arquivo do kit simulado, acrescentando uma linha ao fim. */
async function changeInKit(source: string, line: string) {
  const content = await readFile(join(nextCore, source), 'utf8');
  await writeFile(join(nextCore, source), `${content}\n${line}\n`, 'utf8');
}

describe('update', () => {
  it('requires an installed kit and points to init', async () => {
    expect(await update(['--yes'])).toBe(1);
    expect(output).toContain('Rode "my-spec-kit init" primeiro');
    expect(await readdir(root)).toEqual([]);
  });

  it('updates a file that was not edited and records the new hash', async () => {
    await init(['--type', 'api', '--yes']);
    await changeInKit('skills/spec-new/SKILL.md', 'Linha nova da versão seguinte.');

    expect(await update(['--yes'])).toBe(0);

    const skill = await read('.claude/skills/spec-new/SKILL.md');
    expect(skill).toContain('Linha nova da versão seguinte.');
    expect((await manifest()).files['.claude/skills/spec-new/SKILL.md']?.sha256).toBe(hashContent(skill));
    expect(output).toMatch(/atualizar\s+\.claude\/skills\/spec-new\/SKILL\.md/);
  });

  it('keeps an edited file intact and reports the conflict', async () => {
    await init(['--type', 'api', '--yes']);
    const installedHash = (await manifest()).files['.claude/skills/spec-design/SKILL.md']?.sha256;
    await put('.claude/skills/spec-design/SKILL.md', 'minha versão\n');
    await changeInKit('skills/spec-design/SKILL.md', 'Linha nova da versão seguinte.');

    expect(await update(['--yes'])).toBe(2);

    expect(await read('.claude/skills/spec-design/SKILL.md')).toBe('minha versão\n');
    expect(output).toMatch(/conflito\s+\.claude\/skills\/spec-design\/SKILL\.md\s+\(editado desde a instalação\)/);
    // O hash original fica registrado, para o próximo update continuar reconhecendo a edição.
    expect((await manifest()).files['.claude/skills/spec-design/SKILL.md']?.sha256).toBe(installedHash);
  });

  it('overwrites an edited file with --force and keeps a backup', async () => {
    await init(['--type', 'api', '--yes']);
    await put('.claude/skills/spec-design/SKILL.md', 'minha versão\n');
    await changeInKit('skills/spec-design/SKILL.md', 'Linha nova da versão seguinte.');

    expect(await update(['--yes', '--force'])).toBe(0);

    expect(await read('.claude/skills/spec-design/SKILL.md')).toContain('Linha nova da versão seguinte.');
    const backups = Object.keys(await snapshot()).filter((p) => p.startsWith('.my-spec-kit/backup/'));
    expect(backups).toEqual([expect.stringMatching(/\/\.claude\/skills\/spec-design\/SKILL\.md$/)]);
  });

  it('creates a file that is new in the kit', async () => {
    await init(['--type', 'api', '--yes']);
    await put('skills/spec-extra/SKILL.md', '---\nname: spec-extra\n---\n\nSkill nova.\n', nextCore);

    expect(await update(['--yes'])).toBe(0);

    expect(await read('.claude/skills/spec-extra/SKILL.md')).toContain('Skill nova.');
    expect((await manifest()).files).toHaveProperty(['.claude/skills/spec-extra/SKILL.md']);
  });

  it('removes a file that left the kit only when it was not edited', async () => {
    await init(['--type', 'api', '--yes']);
    await put('.claude/skills/spec-implement/SKILL.md', 'minha versão\n');
    await rm(join(nextCore, 'skills/spec-tasks'), { recursive: true });
    await rm(join(nextCore, 'skills/spec-implement'), { recursive: true });

    expect(await update(['--yes'])).toBe(2);

    const files = (await manifest()).files;
    expect(Object.keys(await snapshot())).not.toContain('.claude/skills/spec-tasks/SKILL.md');
    expect(files).not.toHaveProperty(['.claude/skills/spec-tasks/SKILL.md']);
    expect(await read('.claude/skills/spec-implement/SKILL.md')).toBe('minha versão\n');
    expect(output).toMatch(/conflito\s+\.claude\/skills\/spec-implement\/SKILL\.md\s+\(saiu do kit, mas foi editado\)/);
    expect(files).not.toHaveProperty(['.claude/skills/spec-implement/SKILL.md']);
  });

  it('never touches a steering seed, even with --force', async () => {
    await init(['--type', 'api', '--yes']);
    const seed = await read('docs/steering/product.md');
    await put('docs/steering/tech.md', 'steering preenchido\n');
    await changeInKit('steering/product.md', 'Seção nova da semente.');
    await changeInKit('steering/tech.md', 'Seção nova da semente.');

    await update(['--yes', '--force']);

    expect(await read('docs/steering/product.md')).toBe(seed);
    expect(await read('docs/steering/tech.md')).toBe('steering preenchido\n');
  });

  it('changes only the inside of the CLAUDE.md block', async () => {
    await put('CLAUDE.md', '# Meu projeto\n\nRegras de antes.\n');
    await init(['--type', 'api', '--yes']);
    await writeFile(join(root, 'CLAUDE.md'), `${await read('CLAUDE.md')}\nRegras de depois.\n`, 'utf8');
    await changeInKit('instructions/sdd.md', '- Regra nova do kit.');

    expect(await update(['--yes'])).toBe(0);

    const claude = await read('CLAUDE.md');
    const end = claude.indexOf(BLOCK_END) + BLOCK_END.length;
    expect(claude.startsWith(`# Meu projeto\n\nRegras de antes.\n`)).toBe(true);
    expect(claude.slice(claude.indexOf(BLOCK_START), end)).toContain('- Regra nova do kit.');
    expect(claude.slice(end)).toContain('Regras de depois.');
  });

  it('records the new kit version and the update date', async () => {
    await init(['--type', 'api', '--yes']);
    const installed = await manifest();
    await put('.my-spec-kit/manifest.json', JSON.stringify({ ...installed, kitVersion: '0.0.1' }));

    expect(await update(['--yes'])).toBe(0);

    const updated = await manifest();
    expect(updated.kitVersion).toBe(KIT_VERSION);
    expect(updated.updatedAt).toBe('2026-11-01T09:00:00.000Z');
    expect(updated.installedAt).toBe(installed.installedAt);
    expect(output).toContain(`de 0.0.1 para ${KIT_VERSION}`);
  });

  it('uses the installed type, so front keeps its templates and spec-style', async () => {
    await init(['--type', 'front', '--yes']);
    await changeInKit('skills/spec-style/SKILL.md', 'Linha nova da versão seguinte.');

    expect(await update(['--yes'])).toBe(0);

    expect(await read('.claude/skills/spec-style/SKILL.md')).toContain('Linha nova da versão seguinte.');
    expect((await manifest()).projectType).toBe('front');
  });

  it('writes nothing with --dry-run', async () => {
    await init(['--type', 'api', '--yes']);
    await changeInKit('skills/spec-new/SKILL.md', 'Linha nova da versão seguinte.');
    const before = await snapshot();

    expect(await update(['--dry-run'])).toBe(0);

    expect(await snapshot()).toEqual(before);
    expect(output).toContain('--dry-run: nada foi alterado.');
  });

  it('says there is nothing to do when the kit did not change', async () => {
    await init(['--type', 'api', '--yes']);
    const before = await snapshot();

    expect(await update(['--yes'])).toBe(0);

    expect(await snapshot()).toEqual(before);
    expect(output).toContain('Nada a fazer');
  });

  it('cancels when the person does not confirm', async () => {
    await init(['--type', 'api', '--yes']);
    await changeInKit('skills/spec-new/SKILL.md', 'Linha nova da versão seguinte.');
    const before = await snapshot();

    expect(await update([], { interactive: true, ask: async () => 'n' })).toBe(1);

    expect(await snapshot()).toEqual(before);
  });
});

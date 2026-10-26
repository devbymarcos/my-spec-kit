import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { run } from '../../src/cli/main.js';
import type { CliContext } from '../../src/cli/context.js';
import { BLOCK_START } from '../../src/engine/block.js';
import { hashContent } from '../../src/engine/hash.js';
import type { Manifest } from '../../src/engine/manifest.js';

let root: string;
let output: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'my-spec-kit-'));
  output = '';
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
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

const init = (args: string[], overrides?: Partial<CliContext>) => run(['init', ...args], ctx(overrides));

async function put(path: string, content: string) {
  await mkdir(dirname(join(root, path)), { recursive: true });
  await writeFile(join(root, path), content, 'utf8');
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

describe('init', () => {
  it('installs the api kit in an empty project', async () => {
    const code = await init(['--type', 'api', '--agent', 'claude', '--yes']);

    expect(code).toBe(0);
    expect(Object.keys(await snapshot()).sort()).toEqual([
      '.claude/skills/spec-design/SKILL.md',
      '.claude/skills/spec-implement/SKILL.md',
      '.claude/skills/spec-new/SKILL.md',
      '.claude/skills/spec-steering/SKILL.md',
      '.claude/skills/spec-tasks/SKILL.md',
      '.my-spec-kit/manifest.json',
      'CLAUDE.md',
      'docs/steering/product.md',
      'docs/steering/structure.md',
      'docs/steering/tech.md',
      'specs/README.md',
      'specs/_templates/design.md',
      'specs/_templates/requirements.md',
      'specs/_templates/tasks.md',
    ]);
    expect(await manifest()).toMatchObject({ projectType: 'api', agents: ['claude'], installedAt: '2026-10-26T12:00:00.000Z' });
    expect(await read('specs/_templates/design.md')).toContain('## Contrato da API');
    expect(output).toContain('/spec-steering');
  });

  it('installs the front templates and spec-style, without creating style.md', async () => {
    expect(await init(['--type', 'front', '--yes'])).toBe(0);

    const files = await snapshot();
    expect(files).toHaveProperty(['.claude/skills/spec-style/SKILL.md']);
    expect(files).not.toHaveProperty(['docs/steering/style.md']);
    expect(await read('specs/_templates/design.md')).toContain('## Telas e navegação');
    expect((await manifest()).projectType).toBe('front');
  });

  it('requires --type when it cannot ask', async () => {
    expect(await init(['--yes'])).toBe(1);
    expect(output).toContain('--type');
    expect(await snapshot()).toEqual({});
  });

  it('asks for the type when interactive', async () => {
    const answers = ['front', 's'];
    const code = await init([], { interactive: true, ask: async () => answers.shift() ?? '' });

    expect(code).toBe(0);
    expect((await manifest()).projectType).toBe('front');
  });

  it('rejects an invalid type and an unsupported agent', async () => {
    expect(await init(['--type', 'mobile', '--yes'])).toBe(1);
    expect(output).toContain('api ou front');

    expect(await init(['--type', 'api', '--agent', 'codex', '--yes'])).toBe(1);
    expect(output).toContain('ainda não é suportado');
    expect(await snapshot()).toEqual({});
  });

  it('appends the block to an existing CLAUDE.md and keeps the rest intact', async () => {
    const original = '# Meu projeto\n\nRegras que já existiam.\n';
    await put('CLAUDE.md', original);

    await init(['--type', 'api', '--yes']);

    const claude = await read('CLAUDE.md');
    expect(claude.startsWith(original)).toBe(true);
    expect(claude).toContain(BLOCK_START);
    expect(claude).toContain('@docs/steering/tech.md');
  });

  it('never overwrites a customized file and reports the conflict', async () => {
    await put('.claude/skills/spec-new/SKILL.md', 'minha versão\n');

    const code = await init(['--type', 'api', '--yes']);

    expect(code).toBe(2);
    expect(await read('.claude/skills/spec-new/SKILL.md')).toBe('minha versão\n');
    expect(output).toMatch(/conflito\s+\.claude\/skills\/spec-new\/SKILL\.md/);
    expect((await manifest()).files).not.toHaveProperty(['.claude/skills/spec-new/SKILL.md']);
  });

  it('overwrites a conflict with --force and keeps a backup', async () => {
    await put('.claude/skills/spec-new/SKILL.md', 'minha versão\n');

    expect(await init(['--type', 'api', '--yes', '--force'])).toBe(0);

    expect(await read('.claude/skills/spec-new/SKILL.md')).toContain('name: spec-new');
    const backups = Object.keys(await snapshot()).filter((p) => p.startsWith('.my-spec-kit/backup/'));
    expect(backups).toEqual([expect.stringMatching(/\/\.claude\/skills\/spec-new\/SKILL\.md$/)]);
  });

  it('never touches an existing steering file, even with --force', async () => {
    await put('docs/steering/tech.md', 'steering preenchido\n');

    await init(['--type', 'api', '--yes', '--force']);

    expect(await read('docs/steering/tech.md')).toBe('steering preenchido\n');
  });

  it('is idempotent: a second run changes nothing', async () => {
    await init(['--type', 'api', '--yes']);
    const before = await snapshot();
    output = '';

    const code = await init(['--type', 'api', '--yes']);

    expect(code).toBe(0);
    expect(await snapshot()).toEqual(before);
    expect(output).toContain('Nada a fazer');
  });

  it('reuses the installed type and refuses to switch it', async () => {
    await init(['--type', 'api', '--yes']);

    expect(await init(['--yes'])).toBe(0);
    expect(await init(['--type', 'front', '--yes'])).toBe(1);
    expect(output).toContain('já foi instalado como "api"');
  });

  it('touches only the files in the plan', async () => {
    await put('src/index.ts', 'console.log(1);\n');
    await put('README.md', '# Projeto\n');
    await put('.claude/settings.json', '{}\n');
    const before = await snapshot();

    await init(['--type', 'api', '--yes']);

    const after = await snapshot();
    for (const [path, hash] of Object.entries(before)) expect(after[path]).toBe(hash);
  });

  it('writes nothing with --dry-run', async () => {
    await put('CLAUDE.md', '# Projeto\n');
    const before = await snapshot();

    expect(await init(['--type', 'api', '--dry-run'])).toBe(0);

    expect(await snapshot()).toEqual(before);
    expect(output).toContain('--dry-run');
    expect(output).toMatch(/criar\s+specs\/README\.md/);
  });

  it('refuses to apply without --yes when there is no terminal', async () => {
    expect(await init(['--type', 'api'])).toBe(1);
    expect(output).toContain('--yes');
    expect(await snapshot()).toEqual({});
  });

  it('cancels when the person does not confirm', async () => {
    expect(await init(['--type', 'api'], { interactive: true, ask: async () => 'n' })).toBe(1);
    expect(await snapshot()).toEqual({});
  });

  it('reports an invalid manifest without changing anything', async () => {
    await put('.my-spec-kit/manifest.json', '{ quebrado');

    expect(await init(['--type', 'api', '--yes'])).toBe(1);
    expect(output).toContain('manifest.json está inválido');
  });
});

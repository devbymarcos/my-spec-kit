import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { AgentAdapter } from '../adapters/types.js';
import { normalizeEol } from './hash.js';
import type { CatalogEntry, ProjectType } from './types.js';

/** Skills instaladas só em um tipo de projeto. */
const TYPE_ONLY_SKILLS: Readonly<Record<string, ProjectType>> = {
  'spec-style': 'front',
};

/** Monta a lista de arquivos que o kit instala para um tipo de projeto e um conjunto de agentes. */
export async function buildCatalog(
  coreDir: string,
  projectType: ProjectType,
  adapters: readonly AgentAdapter[],
): Promise<CatalogEntry[]> {
  const entries = new Map<string, CatalogEntry>();
  const add = (entry: CatalogEntry) => entries.set(entry.target, entry);
  const read = async (source: string) => normalizeEol(await readFile(join(coreDir, source), 'utf8'));

  for (const adapter of adapters) {
    for (const skill of await listDirs(join(coreDir, 'skills'))) {
      const onlyFor = TYPE_ONLY_SKILLS[skill];
      if (onlyFor && onlyFor !== projectType) continue;

      for (const file of await listFiles(join(coreDir, 'skills', skill))) {
        const source = `skills/${skill}/${file}`;
        const content = await read(source);
        add({
          target: `${adapter.skillsDir}/${skill}/${file}`,
          source,
          kind: 'managed',
          content: file === 'SKILL.md' ? adapter.renderSkill(skill, content) : content,
        });
      }
    }

    add({
      target: adapter.instructionsFile,
      source: 'instructions/sdd.md',
      kind: 'block',
      content: adapter.renderInstructions(await read('instructions/sdd.md')),
    });
  }

  add({ target: 'specs/README.md', source: 'specs/README.md', kind: 'managed', content: await read('specs/README.md') });

  // Templates comuns ficam na raiz de _templates/; os do tipo, em _templates/<tipo>/.
  for (const dir of ['specs/_templates', `specs/_templates/${projectType}`]) {
    for (const file of await listFiles(join(coreDir, dir), { recursive: false })) {
      const source = `${dir}/${file}`;
      add({ target: `specs/_templates/${file}`, source, kind: 'managed', content: await read(source) });
    }
  }

  for (const file of await listFiles(join(coreDir, 'steering'), { recursive: false })) {
    const source = `steering/${file}`;
    add({ target: `docs/steering/${file}`, source, kind: 'seed', content: await read(source) });
  }

  return [...entries.values()].sort((a, b) => a.target.localeCompare(b.target));
}

async function listDirs(dir: string): Promise<string[]> {
  const items = await readdir(dir, { withFileTypes: true });
  return items.filter((i) => i.isDirectory()).map((i) => i.name).sort();
}

/** Arquivos de `dir`, com caminho relativo usando `/`. */
async function listFiles(dir: string, { recursive = true } = {}): Promise<string[]> {
  const items = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const item of items) {
    if (item.isFile()) files.push(item.name);
    else if (item.isDirectory() && recursive) {
      for (const nested of await listFiles(join(dir, item.name))) files.push(`${item.name}/${nested}`);
    }
  }
  return files.sort();
}

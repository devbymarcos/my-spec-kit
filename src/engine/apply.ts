import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { PlanAction } from './plan.js';

export const BACKUP_DIR = '.my-spec-kit/backup';

/** Lê do projeto o conteúdo atual de cada caminho (os que não existem ficam de fora). */
export async function readCurrent(root: string, targets: Iterable<string>): Promise<Map<string, string>> {
  const current = new Map<string, string>();
  for (const target of new Set(targets)) {
    try {
      current.set(target, await readFile(toPath(root, target), 'utf8'));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  return current;
}

/** Grava o plano no disco. `stamp` nomeia a pasta de backup (usada só quando há `backup`). */
export async function applyPlan(root: string, actions: readonly PlanAction[], stamp: string): Promise<void> {
  for (const action of actions) {
    const path = toPath(root, action.target);

    if (action.backup) {
      const backupPath = toPath(root, `${BACKUP_DIR}/${stamp}/${action.target}`);
      await mkdir(dirname(backupPath), { recursive: true });
      await copyFile(path, backupPath);
    }

    if (action.type === 'create' || action.type === 'update') {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, action.content ?? '', 'utf8');
    } else if (action.type === 'remove') {
      await rm(path, { force: true });
    }
  }
}

function toPath(root: string, target: string): string {
  return join(root, ...target.split('/'));
}

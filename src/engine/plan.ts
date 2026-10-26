import { findBlock, upsertBlock } from './block.js';
import { hashContent } from './hash.js';
import type { Manifest, ManifestFile } from './manifest.js';
import type { CatalogEntry, FileKind, ProjectType } from './types.js';

export type ActionType = 'create' | 'update' | 'unchanged' | 'conflict' | 'skip-seed' | 'remove';

export interface PlanAction {
  type: ActionType;
  target: string;
  kind: FileKind;
  source: string;
  /** Conteúdo completo a gravar no arquivo (`create`/`update`). */
  content?: string;
  /** Hash que vai para o manifesto (para `block`, só do miolo). */
  hash?: string;
  /** Guardar cópia do arquivo atual antes de sobrescrever ou remover (`--force`). */
  backup?: boolean;
  /** Ação sobre um arquivo que o kit deixou de ter. */
  orphan?: boolean;
  reason?: string;
}

export interface PlanInput {
  catalog: readonly CatalogEntry[];
  /** Conteúdo atual no projeto de cada caminho do catálogo e do manifesto (ausente = não existe). */
  current: ReadonlyMap<string, string>;
  manifest?: Manifest;
  force?: boolean;
}

/** Compara kit × projeto × manifesto e decide o que fazer com cada arquivo. Não acessa o disco. */
export function planInstall({ catalog, current, manifest, force = false }: PlanInput): PlanAction[] {
  const actions = catalog.map((entry) =>
    planEntry(entry, current.get(entry.target), manifest?.files[entry.target], force),
  );

  const inCatalog = new Set(catalog.map((e) => e.target));
  for (const [target, file] of Object.entries(manifest?.files ?? {})) {
    if (file.kind !== 'managed' || inCatalog.has(target)) continue;
    const text = current.get(target);
    if (text === undefined) continue;

    const base = { target, kind: file.kind, source: file.source, orphan: true };
    if (hashContent(text) === file.sha256) actions.push({ ...base, type: 'remove' });
    else if (force) actions.push({ ...base, type: 'remove', backup: true });
    else actions.push({ ...base, type: 'conflict', reason: 'saiu do kit, mas foi editado' });
  }

  return actions;
}

function planEntry(
  entry: CatalogEntry,
  text: string | undefined,
  previous: ManifestFile | undefined,
  force: boolean,
): PlanAction {
  const base = { target: entry.target, kind: entry.kind, source: entry.source };

  if (entry.kind === 'seed') {
    return text === undefined
      ? { ...base, type: 'create', content: entry.content }
      : { ...base, type: 'skip-seed' };
  }

  if (entry.kind === 'block') {
    const hash = hashContent(entry.content.trim());
    if (text === undefined) return { ...base, type: 'create', hash, content: upsertBlock(undefined, entry.content) };

    const lookup = findBlock(text);
    if (lookup.status === 'corrupt') {
      return { ...base, type: 'conflict', reason: 'marcadores do bloco incompletos ou duplicados' };
    }
    if (lookup.status === 'missing') {
      return { ...base, type: 'create', hash, content: upsertBlock(text, entry.content), reason: 'bloco adicionado ao fim' };
    }

    const currentHash = hashContent(lookup.inner);
    if (currentHash === hash) return { ...base, type: 'unchanged', hash };
    const content = upsertBlock(text, entry.content);
    if (previous?.sha256 === currentHash) return { ...base, type: 'update', hash, content };
    if (force) return { ...base, type: 'update', hash, content, backup: true };
    return { ...base, type: 'conflict', reason: previous ? 'bloco editado' : 'bloco já existe e é diferente' };
  }

  const hash = hashContent(entry.content);
  if (text === undefined) return { ...base, type: 'create', hash, content: entry.content };

  const currentHash = hashContent(text);
  if (currentHash === hash) return { ...base, type: 'unchanged', hash };
  if (previous?.sha256 === currentHash) return { ...base, type: 'update', hash, content: entry.content };
  if (force) return { ...base, type: 'update', hash, content: entry.content, backup: true };
  return {
    ...base,
    type: 'conflict',
    reason: previous ? 'editado desde a instalação' : 'já existe e não foi instalado pelo kit',
  };
}

export function hasFileChanges(actions: readonly PlanAction[]): boolean {
  return actions.some((a) => a.type === 'create' || a.type === 'update' || a.type === 'remove');
}

export interface ManifestMeta {
  kitVersion: string;
  projectType: ProjectType;
  agents: string[];
  now: string;
}

/** Manifesto que reflete o projeto depois de aplicar o plano. */
export function buildManifest(
  actions: readonly PlanAction[],
  previous: Manifest | undefined,
  meta: ManifestMeta,
): Manifest {
  const files: Record<string, ManifestFile> = {};

  for (const action of actions) {
    const { target, kind, source } = action;
    switch (action.type) {
      case 'create':
      case 'update':
      case 'unchanged':
        files[target] = kind === 'seed' ? { kind, source } : { kind, source, sha256: action.hash! };
        break;
      case 'skip-seed':
        files[target] = { kind, source };
        break;
      case 'conflict': {
        // Arquivo do kit que a pessoa editou continua registrado, para o próximo update saber.
        const kept = previous?.files[target];
        if (kept && !action.orphan) files[target] = kept;
        break;
      }
      case 'remove':
        break;
    }
  }

  const sorted = Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)));
  return {
    kitVersion: meta.kitVersion,
    projectType: meta.projectType,
    agents: meta.agents,
    installedAt: previous?.installedAt ?? meta.now,
    updatedAt: meta.now,
    files: sorted,
  };
}

/** Indica se o manifesto novo difere do anterior, ignorando as datas. */
export function manifestChanged(next: Manifest, previous: Manifest | undefined): boolean {
  if (!previous) return true;
  const strip = ({ installedAt: _i, updatedAt: _u, ...rest }: Manifest) => JSON.stringify(rest);
  return strip(next) !== strip(previous);
}

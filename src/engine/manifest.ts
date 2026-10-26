import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { UserError } from '../errors.js';
import { isProjectType, type FileKind, type ProjectType } from './types.js';

export const MANIFEST_PATH = '.my-spec-kit/manifest.json';

export interface ManifestFile {
  kind: FileKind;
  source: string;
  /** Hash do conteúdo instalado (para `block`, só do miolo). Sementes não têm. */
  sha256?: string;
}

export interface Manifest {
  kitVersion: string;
  projectType: ProjectType;
  agents: string[];
  installedAt: string;
  updatedAt: string;
  files: Record<string, ManifestFile>;
}

export async function readManifest(root: string): Promise<Manifest | undefined> {
  let raw: string;
  try {
    raw = await readFile(join(root, MANIFEST_PATH), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }

  const invalid = () =>
    new UserError(`${MANIFEST_PATH} está inválido. Corrija o arquivo ou apague-o e rode "init" de novo.`);

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw invalid();
  }
  if (!isManifest(data)) throw invalid();
  return data;
}

export async function writeManifest(root: string, manifest: Manifest): Promise<void> {
  const path = join(root, MANIFEST_PATH);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

function isManifest(data: unknown): data is Manifest {
  if (typeof data !== 'object' || data === null) return false;
  const m = data as Record<string, unknown>;
  return (
    typeof m.kitVersion === 'string' &&
    typeof m.projectType === 'string' &&
    isProjectType(m.projectType) &&
    Array.isArray(m.agents) &&
    m.agents.every((a) => typeof a === 'string') &&
    typeof m.installedAt === 'string' &&
    typeof m.updatedAt === 'string' &&
    typeof m.files === 'object' &&
    m.files !== null &&
    Object.values(m.files).every(isManifestFile)
  );
}

function isManifestFile(data: unknown): data is ManifestFile {
  if (typeof data !== 'object' || data === null) return false;
  const f = data as Record<string, unknown>;
  return (
    (f.kind === 'managed' || f.kind === 'seed' || f.kind === 'block') &&
    typeof f.source === 'string' &&
    (f.sha256 === undefined || typeof f.sha256 === 'string')
  );
}

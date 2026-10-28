import { findAdapter } from '../../adapters/registry.js';
import type { AgentAdapter } from '../../adapters/types.js';
import { UserError } from '../../errors.js';
import { readManifest } from '../../engine/manifest.js';
import { KIT_VERSION } from '../../version.js';
import type { CliContext } from '../context.js';
import { runInstall } from './install.js';

export interface UpdateOptions {
  dryRun: boolean;
  yes: boolean;
  force: boolean;
}

export async function updateCommand(options: UpdateOptions, ctx: CliContext): Promise<number> {
  const manifest = await readManifest(ctx.cwd);
  if (!manifest) {
    throw new UserError('O kit não está instalado neste projeto. Rode "my-spec-kit init" primeiro.');
  }

  const adapters = manifest.agents.map((id): AgentAdapter => {
    const adapter = findAdapter(id);
    if (!adapter) throw new UserError(`O agente "${id}" do manifesto não é suportado nesta versão da CLI.`);
    return adapter;
  });

  const headerNote =
    manifest.kitVersion === KIT_VERSION ? undefined : `de ${manifest.kitVersion} para ${KIT_VERSION}`;
  const { exitCode } = await runInstall(
    { command: 'update', headerNote, projectType: manifest.projectType, adapters, manifest, ...options },
    ctx,
  );
  return exitCode;
}

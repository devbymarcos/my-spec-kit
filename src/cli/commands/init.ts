import { resolveAgents } from '../../adapters/registry.js';
import { UserError } from '../../errors.js';
import { readManifest } from '../../engine/manifest.js';
import { isProjectType, PROJECT_TYPES, type ProjectType } from '../../engine/types.js';
import type { CliContext } from '../context.js';
import { runInstall } from './install.js';

export interface InitOptions {
  type?: string;
  agent?: string;
  dryRun: boolean;
  yes: boolean;
  force: boolean;
}

export async function initCommand(options: InitOptions, ctx: CliContext): Promise<number> {
  const manifest = await readManifest(ctx.cwd);
  const projectType = await resolveProjectType(options.type, manifest?.projectType, ctx);
  const adapters = resolveAgents(options.agent);

  const { exitCode, applied } = await runInstall(
    { command: 'init', projectType, adapters, manifest, ...options },
    ctx,
  );
  if (applied && !manifest) {
    ctx.out('Próximo passo: no Claude Code, rode /spec-steering para preencher o steering do projeto.\n');
  }
  return exitCode;
}

async function resolveProjectType(
  option: string | undefined,
  installed: ProjectType | undefined,
  ctx: CliContext,
): Promise<ProjectType> {
  const valid = PROJECT_TYPES.join(' ou ');

  if (option !== undefined) {
    if (!isProjectType(option)) throw new UserError(`Tipo de projeto inválido: "${option}". Use ${valid}.`);
    if (installed && installed !== option) {
      throw new UserError(
        `O projeto já foi instalado como "${installed}". Trocar o tipo ainda não é suportado.`,
      );
    }
    return option;
  }

  if (installed) return installed;

  if (!ctx.interactive) throw new UserError(`Informe o tipo de projeto com --type (${valid}).`);
  const answer = (await ctx.ask(`Tipo de projeto (${PROJECT_TYPES.join('/')}): `)).trim().toLowerCase();
  if (!isProjectType(answer)) throw new UserError(`Tipo de projeto inválido: "${answer}". Use ${valid}.`);
  return answer;
}

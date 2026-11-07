import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveAgents } from '../../adapters/registry.js';
import { UserError } from '../../errors.js';
import { readManifest } from '../../engine/manifest.js';
import { isProjectType, PROJECT_TYPES, type ProjectType } from '../../engine/types.js';
import type { CliContext } from '../context.js';
import { runInstall } from './install.js';

const STEERING_DIR = 'docs/steering';

export interface InitOptions {
  type?: string;
  agent?: string;
  replaceAgents?: boolean;
  dryRun: boolean;
  yes: boolean;
  force: boolean;
}

export async function initCommand(options: InitOptions, ctx: CliContext): Promise<number> {
  const manifest = await readManifest(ctx.cwd);
  const projectType = await resolveProjectType(options.type, manifest?.projectType, ctx);
  const adapters = resolveAgents(options.agent, manifest?.agents, { replace: options.replaceAgents });
  // Lido antes de instalar, porque a instalação cria as sementes que faltam.
  const existingSteering = await listSteering(ctx.cwd);

  const { exitCode, applied } = await runInstall(
    { command: 'init', projectType, adapters, manifest, ...options },
    ctx,
  );
  if (applied) {
    if (!manifest) {
      const hints = adapters.map((a) => `no ${a.displayName}, ${a.steeringHint}`).join('; ');
      ctx.out(
        existingSteering.length > 0
          ? `O steering que já existia (${existingSteering.join(', ')}) foi mantido e passa a ser usado pelo agente.` +
              ` Para o agente revisá-lo e completar só o que faltar: ${hints}.\n`
          : `Próximo passo: preencha o steering do projeto (${hints}).\n`,
      );
    } else {
      const newAgents = adapters.filter((a) => !manifest.agents.includes(a.id));
      if (newAgents.length > 0) {
        const hints = newAgents.map((a) => `no ${a.displayName}, ${a.steeringHint}`).join('; ');
        ctx.out(`Novo(s) agente(s) configurado(s): ${hints}.\n`);
      }
    }
  }
  return exitCode;
}

async function listSteering(cwd: string): Promise<string[]> {
  try {
    const items = await readdir(join(cwd, STEERING_DIR), { withFileTypes: true });
    return items.filter((i) => i.isFile() && i.name.endsWith('.md')).map((i) => `${STEERING_DIR}/${i.name}`).sort();
  } catch {
    return [];
  }
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

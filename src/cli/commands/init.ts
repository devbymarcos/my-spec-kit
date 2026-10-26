import { resolveAgents } from '../../adapters/registry.js';
import { UserError } from '../../errors.js';
import { applyPlan, readCurrent } from '../../engine/apply.js';
import { buildCatalog } from '../../engine/catalog.js';
import { readManifest, writeManifest, MANIFEST_PATH } from '../../engine/manifest.js';
import {
  buildManifest,
  hasFileChanges,
  manifestChanged,
  planInstall,
  type ActionType,
  type PlanAction,
} from '../../engine/plan.js';
import { isProjectType, PROJECT_TYPES, type ProjectType } from '../../engine/types.js';
import { CORE_DIR } from '../../paths.js';
import { KIT_VERSION } from '../../version.js';
import type { CliContext } from '../context.js';

export interface InitOptions {
  type?: string;
  agent?: string;
  dryRun: boolean;
  yes: boolean;
  force: boolean;
}

/** Código de saída quando a instalação terminou, mas sobraram conflitos. */
export const EXIT_CONFLICTS = 2;

const LABELS: Record<ActionType, string> = {
  create: 'criar',
  update: 'atualizar',
  unchanged: 'sem mudança',
  conflict: 'conflito',
  'skip-seed': 'já existe',
  remove: 'remover',
};

export async function initCommand(options: InitOptions, ctx: CliContext): Promise<number> {
  const manifest = await readManifest(ctx.cwd);
  const projectType = await resolveProjectType(options.type, manifest?.projectType, ctx);
  const adapters = resolveAgents(options.agent);

  const catalog = await buildCatalog(CORE_DIR, projectType, adapters);
  const targets = [...catalog.map((e) => e.target), ...Object.keys(manifest?.files ?? {})];
  const current = await readCurrent(ctx.cwd, targets);
  const actions = planInstall({ catalog, current, manifest, force: options.force });

  const agentNames = adapters.map((a) => a.displayName).join(', ');
  ctx.out(`my-spec-kit ${KIT_VERSION} — init (tipo: ${projectType}, agente: ${agentNames})\n\n`);
  ctx.out(formatPlan(actions));

  const conflicts = actions.filter((a) => a.type === 'conflict').length;
  const exitCode = conflicts > 0 ? EXIT_CONFLICTS : 0;
  if (conflicts > 0) {
    ctx.out(
      `\nArquivos em conflito não serão alterados. Para sobrescrevê-los, rode de novo com --force` +
        ` (uma cópia de cada um vai para .my-spec-kit/backup/).\n`,
    );
  }

  const next = buildManifest(actions, manifest, {
    kitVersion: KIT_VERSION,
    projectType,
    agents: adapters.map((a) => a.id),
    now: ctx.now().toISOString(),
  });
  const changes = hasFileChanges(actions);

  if (!changes && !manifestChanged(next, manifest)) {
    ctx.out('\nNada a fazer: o projeto já está atualizado.\n');
    return exitCode;
  }

  if (options.dryRun) {
    ctx.out('\n--dry-run: nada foi alterado.\n');
    return exitCode;
  }

  if (changes && !options.yes) {
    if (!ctx.interactive) {
      throw new UserError('Sem terminal interativo para confirmar. Rode de novo com --yes para aplicar.');
    }
    const answer = await ctx.ask('\nAplicar estas mudanças? (s/N) ');
    if (!/^s(im)?$/i.test(answer.trim())) {
      ctx.out('Cancelado: nada foi alterado.\n');
      return 1;
    }
  }

  await applyPlan(ctx.cwd, actions, ctx.now().toISOString().replace(/[:.]/g, '-'));
  await writeManifest(ctx.cwd, next);

  ctx.out(`\nPronto. Instalação registrada em ${MANIFEST_PATH}.\n`);
  if (!manifest) {
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

function formatPlan(actions: readonly PlanAction[]): string {
  const width = Math.max(...Object.values(LABELS).map((l) => l.length));
  const lines = actions.map((a) => {
    const reason = a.reason ? `  (${a.reason})` : '';
    return `  ${LABELS[a.type].padEnd(width)}  ${a.target}${reason}`;
  });

  const counts = new Map<ActionType, number>();
  for (const a of actions) counts.set(a.type, (counts.get(a.type) ?? 0) + 1);
  const summary = [...counts].map(([type, n]) => `${n} ${LABELS[type]}`).join(', ');

  return `${lines.join('\n')}\n\nResumo: ${summary}.\n`;
}

import type { AgentAdapter } from '../../adapters/types.js';
import { UserError } from '../../errors.js';
import { applyPlan, readCurrent } from '../../engine/apply.js';
import { buildCatalog } from '../../engine/catalog.js';
import { writeManifest, MANIFEST_PATH, type Manifest } from '../../engine/manifest.js';
import {
  buildManifest,
  hasFileChanges,
  manifestChanged,
  planInstall,
  type ActionType,
  type PlanAction,
} from '../../engine/plan.js';
import type { ProjectType } from '../../engine/types.js';
import { KIT_VERSION } from '../../version.js';
import type { CliContext } from '../context.js';

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

export interface InstallInput {
  /** Nome do comando, mostrado no cabeçalho. */
  command: string;
  /** Texto extra do cabeçalho (ex.: versão anterior). */
  headerNote?: string;
  projectType: ProjectType;
  adapters: readonly AgentAdapter[];
  manifest: Manifest | undefined;
  dryRun: boolean;
  yes: boolean;
  force: boolean;
}

export interface InstallResult {
  exitCode: number;
  /** O plano foi gravado no disco. */
  applied: boolean;
}

/** Fluxo comum de init e update: plano → exibição → confirmação → aplicação → manifesto. */
export async function runInstall(input: InstallInput, ctx: CliContext): Promise<InstallResult> {
  const { projectType, adapters, manifest } = input;

  const catalog = await buildCatalog(ctx.coreDir, projectType, adapters);
  const targets = [...catalog.map((e) => e.target), ...Object.keys(manifest?.files ?? {})];
  const current = await readCurrent(ctx.cwd, targets);
  const actions = planInstall({ catalog, current, manifest, force: input.force });

  const agentNames = adapters.map((a) => a.displayName).join(', ');
  const note = input.headerNote ? `, ${input.headerNote}` : '';
  ctx.out(`my-spec-kit ${KIT_VERSION} — ${input.command} (tipo: ${projectType}, agente: ${agentNames}${note})\n\n`);
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
    ctx.out(
      conflicts > 0
        ? '\nNada mais a aplicar além dos conflitos acima.\n'
        : '\nNada a fazer: o projeto já está atualizado.\n',
    );
    return { exitCode, applied: false };
  }

  if (input.dryRun) {
    ctx.out('\n--dry-run: nada foi alterado.\n');
    return { exitCode, applied: false };
  }

  if (changes && !input.yes) {
    if (!ctx.interactive) {
      throw new UserError('Sem terminal interativo para confirmar. Rode de novo com --yes para aplicar.');
    }
    const answer = await ctx.ask('\nAplicar estas mudanças? (s/N) ');
    if (!/^s(im)?$/i.test(answer.trim())) {
      ctx.out('Cancelado: nada foi alterado.\n');
      return { exitCode: 1, applied: false };
    }
  }

  await applyPlan(ctx.cwd, actions, ctx.now().toISOString().replace(/[:.]/g, '-'));
  await writeManifest(ctx.cwd, next);

  ctx.out(`\nPronto. Instalação registrada em ${MANIFEST_PATH}.\n`);
  return { exitCode, applied: true };
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

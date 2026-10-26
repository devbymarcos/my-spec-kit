import { parseArgs } from 'node:util';
import { UserError } from '../errors.js';
import { KIT_VERSION } from '../version.js';
import { initCommand } from './commands/init.js';
import { defaultContext, type CliContext } from './context.js';

const HELP = `my-spec-kit ${KIT_VERSION}

Uso:
  my-spec-kit init [--type api|front] [--agent claude|all] [--dry-run] [--yes] [--force]
  my-spec-kit update [--dry-run] [--yes] [--force]
  my-spec-kit doctor
  my-spec-kit version

Opções:
  --type      tipo de projeto: api ou front (pergunta se não for informado)
  --agent     agente de IA (padrão: todos os disponíveis)
  --dry-run   mostra o que seria feito, sem alterar nada
  --yes       aplica sem pedir confirmação
  --force     sobrescreve arquivos em conflito, guardando cópia em .my-spec-kit/backup/
`;

/** Executa a CLI e devolve o código de saída. */
export async function run(argv: string[], overrides: Partial<CliContext> = {}): Promise<number> {
  const ctx: CliContext = { ...defaultContext(), ...overrides };

  try {
    const { positionals, values } = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        help: { type: 'boolean', short: 'h' },
        type: { type: 'string' },
        agent: { type: 'string' },
        'dry-run': { type: 'boolean', default: false },
        yes: { type: 'boolean', short: 'y', default: false },
        force: { type: 'boolean', default: false },
      },
    });
    const [command] = positionals;

    if (values.help || command === undefined) {
      ctx.out(HELP);
      return 0;
    }

    switch (command) {
      case 'version':
        ctx.out(`my-spec-kit ${KIT_VERSION}\n`);
        return 0;
      case 'init':
        return await initCommand(
          {
            type: values.type,
            agent: values.agent,
            dryRun: values['dry-run'],
            yes: values.yes,
            force: values.force,
          },
          ctx,
        );
      case 'update':
      case 'doctor':
        ctx.err(`O comando "${command}" ainda não foi implementado.\n`);
        return 1;
      default:
        ctx.err(`Comando desconhecido: "${command}".\n\n${HELP}`);
        return 1;
    }
  } catch (error) {
    // Erros de argumento do parseArgs também são do usuário.
    const isArgError = (error as { code?: string }).code?.startsWith('ERR_PARSE_ARGS');
    if (error instanceof UserError || isArgError) {
      ctx.err(`Erro: ${(error as Error).message}\n`);
      return 1;
    }
    throw error;
  }
}

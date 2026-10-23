import { parseArgs } from 'node:util';
import { KIT_VERSION } from '../version.js';

const HELP = `my-spec-kit ${KIT_VERSION}

Uso:
  my-spec-kit init [--agent claude|all] [--dry-run] [--yes] [--force]
  my-spec-kit update [--dry-run] [--yes] [--force]
  my-spec-kit doctor
  my-spec-kit version
`;

/** Executa a CLI e devolve o código de saída. */
export async function run(argv: string[]): Promise<number> {
  const { positionals, values } = parseArgs({
    args: argv,
    allowPositionals: true,
    strict: false,
    options: { help: { type: 'boolean', short: 'h' } },
  });
  const [command] = positionals;

  if (values.help || command === undefined) {
    process.stdout.write(HELP);
    return 0;
  }

  switch (command) {
    case 'version':
      process.stdout.write(`my-spec-kit ${KIT_VERSION}\n`);
      return 0;
    case 'init':
    case 'update':
    case 'doctor':
      process.stderr.write(`O comando "${command}" ainda não foi implementado.\n`);
      return 1;
    default:
      process.stderr.write(`Comando desconhecido: "${command}".\n\n${HELP}`);
      return 1;
  }
}

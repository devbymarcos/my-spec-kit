import { createInterface } from 'node:readline/promises';
import { CORE_DIR } from '../paths.js';

/** O que a CLI usa do ambiente; os testes trocam por versões controladas. */
export interface CliContext {
  cwd: string;
  /** Pasta com o conteúdo do kit; os testes apontam para uma versão simulada. */
  coreDir: string;
  /** Há uma pessoa no terminal para responder perguntas. */
  interactive: boolean;
  ask(question: string): Promise<string>;
  out(text: string): void;
  err(text: string): void;
  now(): Date;
}

export function defaultContext(): CliContext {
  return {
    cwd: process.cwd(),
    coreDir: CORE_DIR,
    interactive: Boolean(process.stdin.isTTY && process.stdout.isTTY),
    async ask(question) {
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      try {
        return await rl.question(question);
      } finally {
        rl.close();
      }
    },
    out: (text) => process.stdout.write(text),
    err: (text) => process.stderr.write(text),
    now: () => new Date(),
  };
}

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { geminiAdapter } from '../../src/adapters/gemini.js';
import { normalizeEol } from '../../src/engine/hash.js';
import { CORE_DIR } from '../../src/paths.js';

const skills = readdirSync(join(CORE_DIR, 'skills'));
const readCore = (path: string) => normalizeEol(readFileSync(join(CORE_DIR, path), 'utf8'));

/** Lê o comando gerado: descrição (string básica) e prompt (string literal multilinha). */
function parseCommand(toml: string): { description: string; prompt: string } {
  const match = /^description = (".*")\nprompt = '''\n([\s\S]*)'''\n$/.exec(toml);
  if (!match) throw new Error(`comando fora do formato esperado:\n${toml}`);
  return { description: JSON.parse(match[1]!) as string, prompt: match[2]! };
}

describe('geminiAdapter', () => {
  it('installs skills as project commands', () => {
    expect(geminiAdapter.skillTarget('spec-new', 'SKILL.md')).toBe('.gemini/commands/spec-new.toml');
  });

  it.each(skills)('renders skill %s as a valid command', (skill) => {
    const { description, prompt } = parseCommand(
      geminiAdapter.renderSkill(skill, readCore(`skills/${skill}/SKILL.md`)),
    );

    expect(description).toContain(`Uso: /${skill}`);
    expect(prompt).not.toMatch(/^---/);
    expect(prompt).toContain('{{args}}');
    expect(prompt).not.toContain('$ARGUMENTS');
    // O Gemini CLI executa !{...} e injeta arquivos com @{...}: o texto da skill não pode ter isso.
    expect(prompt).not.toMatch(/[!@]\{/);
  });

  it('points the questions rule to the Gemini tool and keeps the steering imports', () => {
    const block = geminiAdapter.renderInstructions(readCore('instructions/sdd.md'));

    expect(block).toContain('`ask_user`');
    expect(block).not.toContain('AskUserQuestion');
    expect(block).toContain('Outro (descrever)');
    expect(block).toContain('@docs/steering/tech.md');
  });
});

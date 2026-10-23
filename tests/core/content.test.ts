import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const coreDir = fileURLToPath(new URL('../../core', import.meta.url));

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(content);
  if (!match?.[1]) return {};
  return Object.fromEntries(
    match[1].split(/\r?\n/).map((line) => {
      const index = line.indexOf(':');
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    }),
  );
}

// Termos de projetos reais que não podem aparecer no kit. A lista fica fora do git
// (um regex por linha) para não expor esses nomes no repositório público.
const forbiddenTermsPath = fileURLToPath(new URL('./forbidden-terms.local.txt', import.meta.url));
const FORBIDDEN_TERMS = existsSync(forbiddenTermsPath)
  ? readFileSync(forbiddenTermsPath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => new RegExp(line, 'i'))
  : [];

describe('core content', () => {
  const files = listFiles(coreDir);

  it.skipIf(FORBIDDEN_TERMS.length === 0).each(files.map((f) => [relative(coreDir, f), f]))(
    '%s has no forbidden terms',
    (_name, path) => {
      const content = readFileSync(path, 'utf8');
      for (const term of FORBIDDEN_TERMS) {
        expect(content, `found ${term}`).not.toMatch(term);
      }
    },
  );

  const skillsDir = join(coreDir, 'skills');
  const skills = readdirSync(skillsDir);

  it('ships the expected skills', () => {
    expect(skills.sort()).toEqual([
      'spec-design',
      'spec-implement',
      'spec-new',
      'spec-steering',
      'spec-style',
      'spec-tasks',
    ]);
  });

  // Seções da metodologia que todo tipo de projeto precisa manter, para os templates não divergirem.
  const REQUIRED_SECTIONS = {
    'requirements.md': [
      '## Contexto',
      '## Fora de escopo',
      '## Requisitos',
      '## Comportamento existente preservado',
      '## Requisitos não funcionais',
      '## Perguntas em aberto',
      '## Decisões',
    ],
    'design.md': [
      '## Visão geral',
      '## Impacto em comportamento existente',
      '## Decisões e alternativas',
      '## Estratégia de testes',
      '## Checklist do steering',
    ],
  };

  describe.each(['api', 'front'])('%s templates', (type) => {
    it.each(Object.entries(REQUIRED_SECTIONS))('%s keeps the methodology sections', (file, sections) => {
      const content = readFileSync(join(coreDir, 'specs', '_templates', type, file), 'utf8');
      for (const section of sections) {
        expect(content).toContain(`\n${section}\n`);
      }
    });
  });

  it.each(skills)('skill %s has valid frontmatter', (skill) => {
    const fm = parseFrontmatter(readFileSync(join(skillsDir, skill, 'SKILL.md'), 'utf8'));

    expect(fm.name).toBe(skill);
    expect(fm.description).toBeTruthy();
    expect(fm.description!.length).toBeLessThanOrEqual(1024);
    expect(fm['disable-model-invocation']).toBe('true');
  });
});

import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { run } from '../../src/cli/main.js';

const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
  version: string;
};

function captureStdout() {
  const chunks: string[] = [];
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    chunks.push(String(chunk));
    return true;
  });
  return () => chunks.join('');
}

describe('version', () => {
  afterEach(() => vi.restoreAllMocks());

  it('prints the package.json version', async () => {
    const output = captureStdout();

    const code = await run(['version']);

    expect(code).toBe(0);
    expect(output()).toBe(`my-spec-kit ${pkg.version}\n`);
  });

  it('prints help when no command is given', async () => {
    const output = captureStdout();

    const code = await run([]);

    expect(code).toBe(0);
    expect(output()).toContain('Uso:');
  });

  it('fails on unknown command', async () => {
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

    expect(await run(['nope'])).toBe(1);
  });
});

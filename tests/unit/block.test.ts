import { describe, expect, it } from 'vitest';
import { BLOCK_END, BLOCK_START, findBlock, upsertBlock } from '../../src/engine/block.js';

describe('upsertBlock', () => {
  it('creates a file with only the block when there is no content', () => {
    expect(upsertBlock(undefined, 'inner')).toBe(`${BLOCK_START}\ninner\n${BLOCK_END}\n`);
    expect(upsertBlock('', 'inner')).toBe(`${BLOCK_START}\ninner\n${BLOCK_END}\n`);
  });

  it('appends the block after existing content without touching it', () => {
    const original = '# Projeto\n\nRegras do projeto.\n';

    const result = upsertBlock(original, 'inner');

    expect(result.startsWith(original)).toBe(true);
    expect(result).toBe(`${original}\n${BLOCK_START}\ninner\n${BLOCK_END}\n`);
  });

  it('adds a line break when the file does not end with one', () => {
    expect(upsertBlock('# Projeto', 'inner')).toBe(`# Projeto\n\n${BLOCK_START}\ninner\n${BLOCK_END}\n`);
  });

  it('replaces only the block, keeping the text around it byte for byte', () => {
    const before = '# Projeto\n\nAntes.\n\n';
    const after = '\n\n## Depois\nTexto final sem quebra';
    const text = `${before}${BLOCK_START}\nantigo\n${BLOCK_END}${after}`;

    const result = upsertBlock(text, 'novo');

    expect(result).toBe(`${before}${BLOCK_START}\nnovo\n${BLOCK_END}${after}`);
  });

  it('keeps CRLF line endings of the file', () => {
    const result = upsertBlock('# Projeto\r\n', 'linha 1\nlinha 2');

    expect(result).toBe(`# Projeto\r\n\r\n${BLOCK_START}\r\nlinha 1\r\nlinha 2\r\n${BLOCK_END}\r\n`);
  });

  it('refuses to edit a file with broken markers', () => {
    expect(() => upsertBlock(`${BLOCK_START}\nsem fim`, 'novo')).toThrow();
  });
});

describe('findBlock', () => {
  it('returns the inner content normalized', () => {
    const lookup = findBlock(`x\r\n${BLOCK_START}\r\n  conteúdo\r\nmais\r\n${BLOCK_END}\r\n`);

    expect(lookup).toMatchObject({ status: 'found', inner: 'conteúdo\nmais' });
  });

  it('accepts a start marker with a different comment text', () => {
    expect(findBlock('<!-- my-spec-kit:start v=0.0.1 -->\na\n<!-- my-spec-kit:end -->')).toMatchObject({
      status: 'found',
      inner: 'a',
    });
  });

  it('reports missing and corrupt blocks', () => {
    expect(findBlock('nada aqui').status).toBe('missing');
    expect(findBlock(`${BLOCK_START}\nsem fim`).status).toBe('corrupt');
    expect(findBlock(`${BLOCK_END}\n${BLOCK_START}`).status).toBe('corrupt');
    expect(findBlock(`${BLOCK_START}${BLOCK_END}${BLOCK_START}${BLOCK_END}`).status).toBe('corrupt');
  });
});

import { normalizeEol } from './hash.js';

export const BLOCK_START =
  '<!-- my-spec-kit:start — conteúdo gerenciado pelo my-spec-kit; edite fora deste bloco -->';
export const BLOCK_END = '<!-- my-spec-kit:end -->';

const START_PATTERN = /<!-- my-spec-kit:start\b[^\n]*?-->/g;
const END_PATTERN = /<!-- my-spec-kit:end -->/g;

export type BlockLookup =
  | { status: 'missing' }
  | { status: 'corrupt' }
  | { status: 'found'; start: number; end: number; inner: string };

/** Localiza o bloco do kit. `inner` vem com fim de linha LF e sem espaços nas pontas. */
export function findBlock(text: string): BlockLookup {
  const starts = [...text.matchAll(START_PATTERN)];
  const ends = [...text.matchAll(END_PATTERN)];

  if (starts.length === 0 && ends.length === 0) return { status: 'missing' };

  const [start] = starts;
  const [end] = ends;
  if (starts.length !== 1 || ends.length !== 1 || !start || !end || start.index > end.index) {
    return { status: 'corrupt' };
  }

  const innerStart = start.index + start[0].length;
  return {
    status: 'found',
    start: start.index,
    end: end.index + end[0].length,
    inner: normalizeEol(text.slice(innerStart, end.index)).trim(),
  };
}

/**
 * Insere ou substitui o bloco do kit em `text`, sem mexer em nada fora dele.
 * Usa o mesmo fim de linha que o arquivo já usa.
 */
export function upsertBlock(text: string | undefined, inner: string): string {
  const eol = text?.includes('\r\n') ? '\r\n' : '\n';
  const block = [BLOCK_START, normalizeEol(inner).trim(), BLOCK_END].join('\n').replace(/\n/g, eol);

  if (text === undefined || text.trim() === '') return block + eol;

  const lookup = findBlock(text);
  switch (lookup.status) {
    case 'found':
      return text.slice(0, lookup.start) + block + text.slice(lookup.end);
    case 'missing': {
      const separator = text.endsWith(eol) ? eol : eol + eol;
      return text + separator + block + eol;
    }
    case 'corrupt':
      throw new Error('Os marcadores do bloco do my-spec-kit estão incompletos ou duplicados.');
  }
}

import { describe, expect, it } from 'vitest';
import { hashContent } from '../../src/engine/hash.js';

describe('hashContent', () => {
  it('treats CRLF and LF as the same content', () => {
    expect(hashContent('a\r\nb\r\n')).toBe(hashContent('a\nb\n'));
  });

  it('differs when content differs', () => {
    expect(hashContent('a')).not.toBe(hashContent('b'));
  });
});

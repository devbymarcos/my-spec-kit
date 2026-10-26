import { createHash } from 'node:crypto';

export function normalizeEol(content: string): string {
  return content.replace(/\r\n/g, '\n');
}

/** sha256 do conteúdo com fim de linha normalizado, para que CRLF e LF contem como iguais. */
export function hashContent(content: string): string {
  return createHash('sha256').update(normalizeEol(content), 'utf8').digest('hex');
}

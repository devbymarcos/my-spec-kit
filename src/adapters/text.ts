/** Separa o frontmatter (campos `chave: valor` de uma linha) do corpo de um `SKILL.md`. */
export function parseSkill(name: string, content: string): { fields: Map<string, string>; body: string } {
  const match = /^---\n([\s\S]*?)\n---\n+/.exec(content);
  if (!match) throw new Error(`Skill "${name}" sem frontmatter.`);

  const fields = new Map<string, string>();
  for (const line of match[1]!.split('\n')) {
    const sep = line.indexOf(':');
    if (sep > 0) fields.set(line.slice(0, sep).trim(), line.slice(sep + 1).trim());
  }
  return { fields, body: content.slice(match[0].length) };
}

/** Troca um trecho que precisa existir; falha se o core mudou e o trecho sumiu. */
export function replaceOnce(content: string, search: string, replacement: string): string {
  if (!content.includes(search)) throw new Error(`Trecho esperado no core não encontrado: ${search}`);
  return content.replace(search, replacement);
}

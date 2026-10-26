export type ProjectType = 'api' | 'front';

export const PROJECT_TYPES: readonly ProjectType[] = ['api', 'front'];

export function isProjectType(value: string): value is ProjectType {
  return (PROJECT_TYPES as readonly string[]).includes(value);
}

/**
 * - `managed`: arquivo do kit; atualizado só se ninguém editou.
 * - `seed`: criado uma vez; depois é do projeto.
 * - `block`: trecho marcado dentro de um arquivo do projeto.
 */
export type FileKind = 'managed' | 'seed' | 'block';

export interface CatalogEntry {
  /** Caminho no projeto de destino, sempre com `/`. */
  target: string;
  /** Caminho de origem relativo a `core/`. */
  source: string;
  kind: FileKind;
  /** Conteúdo a instalar (para `block`, só o miolo do bloco), com fim de linha LF. */
  content: string;
}

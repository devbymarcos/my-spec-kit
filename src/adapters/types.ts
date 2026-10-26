export interface AgentAdapter {
  /** Identificador usado em `--agent`. */
  readonly id: string;
  readonly displayName: string;
  /** Pasta onde o agente descobre skills de projeto. */
  readonly skillsDir: string;
  /** Arquivo de instruções que recebe o bloco SDD. */
  readonly instructionsFile: string;
  /** Converte o `SKILL.md` do core para o formato do agente. */
  renderSkill(name: string, content: string): string;
  /** Converte o bloco de instruções para o formato do agente. */
  renderInstructions(content: string): string;
}

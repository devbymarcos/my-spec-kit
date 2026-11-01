export interface AgentAdapter {
  /** Identificador usado em `--agent`. */
  readonly id: string;
  readonly displayName: string;
  /** Arquivo de instruções que recebe o bloco. */
  readonly instructionsFile: string;
  /** Bloco do core (relativo a `core/`) inserido no arquivo de instruções. */
  readonly instructionsSource: string;
  /** Skills que o agente instala; sem a lista, todas. */
  readonly skills?: readonly string[];
  /** Instala o fluxo de specs (`specs/README.md` e templates). */
  readonly specs: boolean;
  /** Como a pessoa começa a preencher o steering, mostrado no fim do `init`. */
  readonly steeringHint: string;
  /** Caminho no projeto de um arquivo da skill (`file` é relativo à pasta da skill no core). */
  skillTarget(name: string, file: string): string;
  /** Converte o `SKILL.md` do core para o formato do agente. */
  renderSkill(name: string, content: string): string;
  /** Converte o bloco de instruções para o formato do agente. */
  renderInstructions(content: string): string;
}

import { parseSkill, replaceOnce } from './text.js';
import type { AgentAdapter } from './types.js';

// No Gemini CLI, skills são ativadas pelo modelo. Para manter a invocação só explícita
// (`disable-model-invocation`), cada skill vira um comando de projeto em `.gemini/commands/`.
export const geminiAdapter: AgentAdapter = {
  id: 'gemini',
  displayName: 'Gemini CLI',
  instructionsFile: 'GEMINI.md',
  instructionsSource: 'instructions/sdd.md',
  specs: true,
  steeringHint: 'rode /spec-steering',
  skillTarget: (name, file) =>
    file === 'SKILL.md' ? `.gemini/commands/${name}.toml` : `.gemini/commands/${name}/${file}`,
  renderSkill: toCommand,
  renderInstructions: (content) =>
    replaceOnce(
      replaceOnce(content, '(no Claude Code, `AskUserQuestion`)', '(no Gemini CLI, `ask_user`)'),
      '- não crie a opção "Outro": a ferramenta já oferece um campo livre para respostas diferentes;',
      '- a última opção é sempre "Outro (descrever)", para a pessoa poder responder livremente (ela conta no limite de 4);',
    ),
};

/** Converte um `SKILL.md` em comando TOML do Gemini CLI. */
function toCommand(name: string, content: string): string {
  const { fields, body } = parseSkill(name, content);
  const hint = fields.get('argument-hint');
  const description = `${fields.get('description') ?? name}${hint ? ` Uso: /${name} ${hint}` : ''}`;
  const prompt = body.replaceAll('$ARGUMENTS', '{{args}}');

  // String literal multilinha: nada é escapado, então o texto não pode conter o delimitador.
  if (prompt.includes("'''")) throw new Error(`Skill "${name}" contém ''' e não cabe num comando TOML.`);
  // JSON e string básica de TOML usam os mesmos escapes para os caracteres que aparecem aqui.
  return `description = ${JSON.stringify(description)}\nprompt = '''\n${prompt}'''\n`;
}

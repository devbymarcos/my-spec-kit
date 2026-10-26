/** Erro causado por entrada ou estado do usuário: a CLI mostra só a mensagem, sem stack. */
export class UserError extends Error {
  override name = 'UserError';
}

import { UserError } from '../errors.js';
import { claudeAdapter } from './claude.js';
import type { AgentAdapter } from './types.js';

export const ADAPTERS: readonly AgentAdapter[] = [claudeAdapter];

/** Resolve o valor de `--agent` (padrão: todos os disponíveis). */
export function resolveAgents(value: string | undefined): AgentAdapter[] {
  if (value === undefined || value === 'all') return [...ADAPTERS];

  const adapter = ADAPTERS.find((a) => a.id === value);
  if (!adapter) {
    const available = ADAPTERS.map((a) => a.id).join(', ');
    throw new UserError(
      `O agente "${value}" ainda não é suportado nesta versão. Disponíveis: ${available} (ou "all").`,
    );
  }
  return [adapter];
}

export function findAdapter(id: string): AgentAdapter | undefined {
  return ADAPTERS.find((a) => a.id === id);
}

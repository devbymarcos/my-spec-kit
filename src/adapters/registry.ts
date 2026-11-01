import { UserError } from '../errors.js';
import { claudeAdapter } from './claude.js';
import { geminiAdapter } from './gemini.js';
import type { AgentAdapter } from './types.js';

export const ADAPTERS: readonly AgentAdapter[] = [claudeAdapter, geminiAdapter];

/** Agente instalado quando o projeto ainda não tem kit e `--agent` não foi informado. */
export const DEFAULT_AGENT = claudeAdapter.id;

/**
 * Resolve o valor de `--agent` (`claude`, `gemini`, lista separada por vírgula ou `all`).
 * Os agentes já instalados são mantidos: sem isso, os arquivos deles sairiam do catálogo e seriam removidos.
 */
export function resolveAgents(value: string | undefined, installed: readonly string[] = []): AgentAdapter[] {
  const requested =
    value === 'all'
      ? ADAPTERS.map((a) => a.id)
      : value !== undefined
        ? value.split(',').map((id) => id.trim()).filter(Boolean)
        : installed.length > 0
          ? []
          : [DEFAULT_AGENT];

  const ids = new Set([...installed, ...requested]);
  return [...ids].map((id) => {
    const adapter = findAdapter(id);
    if (!adapter) {
      const available = ADAPTERS.map((a) => a.id).join(', ');
      throw new UserError(
        `O agente "${id}" ainda não é suportado nesta versão. Disponíveis: ${available} (ou "all").`,
      );
    }
    return adapter;
  });
}

export function findAdapter(id: string): AgentAdapter | undefined {
  return ADAPTERS.find((a) => a.id === id);
}

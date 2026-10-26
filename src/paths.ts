import { fileURLToPath } from 'node:url';

// core/ fica um nível acima tanto de src/ quanto de dist/.
export const CORE_DIR = fileURLToPath(new URL('../core', import.meta.url));

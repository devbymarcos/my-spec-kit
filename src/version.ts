import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// package.json fica um nível acima tanto de src/ quanto de dist/.
const packageJsonPath = fileURLToPath(new URL('../package.json', import.meta.url));

export const KIT_VERSION: string = (
  JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { version: string }
).version;

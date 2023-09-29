import { IDldcConfigResolved } from '../tasks/readPackageJson';
import { json } from '../utils/json';

export function createVitestConfig(dldcConfig: IDldcConfigResolved) {
  return [
    `import { defineConfig } from 'vitest/config';`,
    dldcConfig.react ? `import react from '@vitejs/plugin-react';` : null,
    ``,
    `export default defineConfig(${json({
      plugins: dldcConfig.react ? [json.raw(`react()`)] : [],
      test: {
        environment: dldcConfig.react ? 'jsdom' : undefined,
        threads: dldcConfig.vitestNoThreads ? false : undefined,
        setupFiles: dldcConfig.vitestSetupFile ? './tests/globalSetup.ts' : undefined,
      },
    })});`,
  ]
    .filter((l) => l !== null)
    .join('\n');
}

import { IDldcConfigResolved } from '../tasks/readPackageJson';
import { json } from '../utils/json';

export function createVitestConfig(dldcConfig: IDldcConfigResolved) {
  return [
    dldcConfig.react ? `import react from '@vitejs/plugin-react';` : null,
    `import { defineConfig } from 'vitest/config';`,
    ``,
    `export default defineConfig(${json({
      plugins: dldcConfig.react ? [json.raw(`react()`)] : [],
      test: {
        environment: dldcConfig.react ? 'jsdom' : undefined,
        poolOptions: dldcConfig.vitestSingleThread ? { threads: { singleThread: true } } : undefined,
        setupFiles: dldcConfig.vitestSetupFile ? './tests/globalSetup.ts' : undefined,
      },
    })});`,
  ]
    .filter((l) => l !== null)
    .join('\n');
}

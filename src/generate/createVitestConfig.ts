import { IDldcConfig } from '../logic/loadDldcConfig';
import { json } from '../utils/json';

export function createVitestConfig(config: IDldcConfig) {
  return [
    `import { defineConfig } from 'vitest/config';`,
    config.react ? `import react from '@vitejs/plugin-react';` : null,
    ``,
    `export default defineConfig(${json({
      plugins: config.react ? [json.raw(`react()`)] : [],
      test: {
        environment: config.react ? 'jsdom' : undefined,
        threads: config.vitestNoThreads ? false : undefined,
        setupFiles: config.vitestSetupFile ? './tests/globalSetup.ts' : undefined,
      },
    })});`,
  ]
    .filter((l) => l !== null)
    .join('\n');
}

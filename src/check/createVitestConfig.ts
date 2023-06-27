import { json } from '../utils/json';
import { IConfig } from '../utils/loadConfig';

export function createVitestConfig(config: IConfig) {
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

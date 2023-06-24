import { IConfig } from '../utils/loadConfig';

export function createVitestConfig(config: IConfig) {
  return [
    `import { defineConfig } from 'vitest/config';`,
    ``,
    `export default defineConfig({`,
    `  test: ${JSON.stringify(
      {
        threads: config.vitestNoThreads ? false : undefined,
        setupFiles: config.vitestSetupFile ? './tests/globalSetup.ts' : undefined,
      },
      null,
      2
    )},`,
    `});`,
  ].join('\n');
}

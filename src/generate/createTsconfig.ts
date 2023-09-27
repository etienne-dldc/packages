import { IDldcConfig } from '../logic/loadDldcConfig';
import { json } from '../utils/json';

export function createTsconfig(config: IDldcConfig): string {
  return json({
    $schema: 'https://json.schemastore.org/tsconfig',
    include: [
      'src',
      'tests',
      'vitest.config.ts',
      ...(config.viteExample ? ['example', 'vite.config.ts'] : []),
      config.scripts && 'scripts',
    ].filter(Boolean),
    compilerOptions: {
      rootDir: '.',

      outDir: 'dist',
      target: 'ESNext',
      module: 'ES2020',
      lib: ['ESNext', 'DOM', 'DOM.Iterable'],
      importHelpers: false,
      moduleResolution: 'node',
      esModuleInterop: true,
      ...(config.react ? { jsx: 'react-jsx' } : {}),

      isolatedModules: true,
      declaration: true,
      sourceMap: true,
      noEmit: true,

      types: [],
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      ...(config.skipLibCheck ? { skipLibCheck: true } : {}),
    },
  });
}

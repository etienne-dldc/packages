import { IDldcConfigResolved } from '../tasks/readPackageJson';
import { json } from '../utils/json';

export function createTsconfig(dldcConfig: IDldcConfigResolved): string {
  return json({
    $schema: 'https://json.schemastore.org/tsconfig',
    include: [
      'src',
      'tests',
      'vitest.config.ts',
      ...(dldcConfig.viteExample ? ['example', 'vite.config.ts'] : []),
      dldcConfig.scripts && 'scripts',
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
      ...(dldcConfig.react ? { jsx: 'react-jsx' } : {}),

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
      ...(dldcConfig.skipLibCheck ? { skipLibCheck: true } : {}),
    },
  });
}

import { json } from '../utils/json';
import { IConfig } from '../utils/loadConfig';

export function createTsconfig(config: IConfig): string {
  return json({
    $schema: 'https://json.schemastore.org/tsconfig',
    include: ['src', 'tests', config.viteExample && 'example', config.scripts && 'scripts'].filter(Boolean),
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

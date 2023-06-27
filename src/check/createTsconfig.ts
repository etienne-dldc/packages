import { IConfig } from '../utils/loadConfig';

export function createTsconfig(config: IConfig): any {
  return {
    $schema: 'https://json.schemastore.org/tsconfig',
    include: ['src', 'tests', config.viteExample ? 'example' : undefined].filter(Boolean),
    compilerOptions: {
      target: 'ESNext',
      module: 'ES2020',
      lib: ['ESNext', 'DOM', 'DOM.Iterable'],
      importHelpers: true,
      declaration: true,
      sourceMap: true,
      rootDir: '.',
      outDir: 'dist',
      strict: true,
      noEmit: true,
      strictPropertyInitialization: true,
      noImplicitThis: true,
      alwaysStrict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      moduleResolution: 'node',
      esModuleInterop: true,
      types: [],
      ...(config.react ? { jsx: 'react-jsx' } : {}),
    },
  };
}

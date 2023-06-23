import { IConfig } from '../utils/loadConfig';

export function createTsconfig(config: IConfig): any {
  return {
    $schema: 'https://json.schemastore.org/tsconfig',
    include: ['src', 'tests'],
    compilerOptions: {
      target: 'ESNext',
      module: 'ES2020',
      lib: config.browser ? ['ESNext', 'DOM', 'DOM.Iterable'] : ['ESNext'],
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
      ...(config.browser ? {} : { skipLibCheck: true }), // required because esbuild would need 'DOM' lib
      ...(config.react ? { jsx: 'react-jsx' } : {}),
    },
  };
}

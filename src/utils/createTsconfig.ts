import { IPackage } from '../packages';

export function createTsconfig(pkg: IPackage): any {
  return {
    $schema: 'https://json.schemastore.org/tsconfig',
    include: ['src', 'tests'],
    compilerOptions: {
      target: 'ESNext',
      module: 'ES2020',
      lib: pkg.browser ? ['ESNext', 'DOM', 'DOM.Iterable'] : ['ESNext'],
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
      ...(pkg.browser ? {} : { skipLibCheck: true }), // required because esbuild would need 'DOM' lib
      ...(pkg.react ? { jsx: 'react-jsx' } : {}),
    },
  };
}

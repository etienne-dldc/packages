import type { PackageJson } from 'types-package-json';
import { IPackage } from '../packages';

interface PackageJsonFixed extends PackageJson {
  sideEffects: boolean;
  exports: Record<string, Record<string, string>>;
  module: string;
  types: string;
  packageManager: string;
  publishConfig: {
    access: string;
    registry: string;
  };
  'release-it': any;
}

export function createPackageJson(prevPackageJson: PackageJson, pkg: IPackage): PackageJsonFixed {
  return {
    name: prevPackageJson.name,
    version: prevPackageJson.version,
    description: prevPackageJson.description,
    keywords: prevPackageJson.keywords,
    homepage: `https://github.com/${pkg.org}/${pkg.name}#readme`,
    bugs: {
      url: `https://github.com/${pkg.org}/${pkg.name}/issues`,
    },
    repository: {
      type: 'git',
      url: `git+https://github.com/${pkg.org}/${pkg.name}.git`,
    },
    license: 'MIT',
    author: 'Etienne Dldc <e.deladonchamps@gmail.com>',
    sideEffects: false,
    exports: {
      '.': {
        import: './dist/mod.mjs',
        require: './dist/mod.js',
        types: './dist/mod.d.ts',
      },
    },
    main: './dist/mod.js',
    module: './dist/mod.mjs',
    types: './dist/mod.d.ts',
    files: ['dist'],
    scripts: {
      build: 'rimraf dist && tsup --format cjs,esm src/mod.ts --dts src/mod.ts',
      ...(pkg.deno ? { 'build:deno': 'rimraf deno && denoify --out deno' } : {}),
      lint: 'prettier . --check && eslint . && tsc --noEmit',
      'lint:fix': 'prettier . --write . && eslint . --fix',
      release: 'release-it',
      test: 'pnpm run lint && vitest run --coverage',
      'test:run': 'vitest run',
      'test:watch': 'vitest --watch',
      typecheck: 'tsc',
      'typecheck:watch': 'tsc --watch',
    },
    dependencies: prevPackageJson.dependencies,
    devDependencies: {
      ...(pkg.browser ? {} : { '@types/node': '^20.3.0' }),
      '@vitest/coverage-v8': '^0.32.0',
      vitest: '^0.32.0',
      '@typescript-eslint/eslint-plugin': '^5.59.9',
      '@typescript-eslint/parser': '^5.59.9',
      ...(pkg.deno ? { denoify: '^1.5.8' } : {}),
      eslint: '^8.42.0',
      'eslint-config-prettier': '^8.8.0',
      prettier: '^2.8.8',
      'release-it': '^15.11.0',
      rimraf: '^5.0.1',
      tslib: '^2.5.3',
      tsup: '^6.7.0',
      typescript: '^5.1.3',
      ...(pkg.additionalDevDependencies ?? {}),
    },
    packageManager: 'pnpm@8.6.1',
    publishConfig: {
      access: 'public',
      registry: 'https://registry.npmjs.org',
    },
    'release-it': {
      hooks: {
        'before:init': ['pnpm test', pkg.deno ? 'pnpm run build:deno' : null].filter(Boolean),
      },
      npm: {
        publish: true,
      },
      github: {
        release: true,
        web: true,
        autoGenerate: true,
      },
    },
  };
}

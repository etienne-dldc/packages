import type { PackageJson } from 'types-package-json';
import { IPackage } from '../packages';
import { IConfig } from '../utils/loadConfig';

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

export function createPackageJson(prevPackageJson: PackageJson, pkg: IPackage, config: IConfig): PackageJsonFixed {
  const prevScriptsScripts = Object.fromEntries(
    Object.entries(prevPackageJson.scripts ?? {}).filter(([key]) => key.startsWith('script:'))
  );

  return {
    name: getPackageName(pkg),
    version: prevPackageJson.version,
    description: prevPackageJson.description,
    keywords: prevPackageJson.keywords,
    homepage: `https://github.com/${pkg.org}/${pkg.repository}#readme`,
    bugs: {
      url: `https://github.com/${pkg.org}/${pkg.repository}/issues`,
    },
    repository: {
      type: 'git',
      url: `git+https://github.com/${pkg.org}/${pkg.repository}.git`,
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
      lint: 'prettier . --check && eslint . && tsc --noEmit',
      'lint:fix': 'prettier . --write . && eslint . --fix',
      release: 'release-it',
      test: 'pnpm run lint && vitest run --coverage',
      'test:run': 'vitest run',
      'test:watch': 'vitest --watch',
      typecheck: 'tsc',
      'typecheck:watch': 'tsc --watch',
      ...(config.viteExample ? { 'example:run': 'vite example' } : undefined),
      ...(config.scripts ? prevScriptsScripts : undefined),
    },
    dependencies: prevPackageJson.dependencies,
    peerDependencies: prevPackageJson.peerDependencies,
    devDependencies: {
      '@types/node': '^20.3.1',
      '@vitest/coverage-v8': '^0.32.0',
      '@typescript-eslint/eslint-plugin': '^5.59.11',
      '@typescript-eslint/parser': '^5.59.11',
      eslint: '^8.42.0',
      'eslint-config-prettier': '^8.8.0',
      prettier: '^2.8.8',
      'release-it': '^15.11.0',
      rimraf: '^5.0.1',
      tslib: '^2.5.3',
      tsup: '^6.7.0',
      typescript: '^5.1.3',
      ...(config.viteExample ? { vite: '^4.3.9' } : {}),
      vitest: '^0.32.0',
      ...(config.additionalDevDependencies ?? {}),
      ...(config.react
        ? {
            'eslint-plugin-react-hooks': '^4.6.0',
            '@testing-library/jest-dom': '^5.16.5',
            '@testing-library/react': '^14.0.0',
            '@testing-library/user-event': '^14.4.3',
            '@types/testing-library__jest-dom': '^5.14.6',
            jsdom: '^22.1.0',
            '@types/react': '^18.2.12',
            '@types/react-dom': '^18.2.5',
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            '@vitejs/plugin-react': '^4.0.1',
          }
        : undefined),
      ...(config.scripts
        ? {
            tsx: '^3.12.7',
            esbuild: '^0.18.10',
          }
        : undefined),
    },
    packageManager: 'pnpm@8.6.1',
    publishConfig: {
      access: 'public',
      registry: 'https://registry.npmjs.org',
    },
    'release-it': {
      hooks: {
        'before:init': ['pnpm run build', 'pnpm test'],
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

function getPackageName(pkg: IPackage): string {
  if (pkg.org === 'dldc-packages') {
    return `@dldc/${pkg.repository}`;
  }
  return `@${pkg.org}/${pkg.repository}`;
}

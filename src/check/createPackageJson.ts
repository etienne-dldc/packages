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
    Object.entries(prevPackageJson.scripts ?? {}).filter(([key]) => key.startsWith('script:')),
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
      'build:watch': 'tsup --watch --format cjs,esm src/mod.ts --dts src/mod.ts',
      lint: 'prettier . --check && eslint . && tsc --noEmit',
      'lint:fix': 'prettier . --write . && eslint . --fix',
      release: 'release-it --only-version',
      test: 'pnpm run lint && vitest run --coverage',
      'test:run': 'vitest run',
      'test:watch': 'vitest --watch',
      changelog:
        'auto-changelog --stdout --hide-credit true --commit-limit false -u --template https://raw.githubusercontent.com/release-it/release-it/main/templates/changelog-compact.hbs',
      typecheck: 'tsc',
      'typecheck:watch': 'tsc --watch',
      ...(config.viteExample ? { 'example:run': 'vite example' } : undefined),
      ...(config.scripts ? prevScriptsScripts : undefined),
    },
    dependencies: prevPackageJson.dependencies,
    peerDependencies: prevPackageJson.peerDependencies,
    devDependencies: {
      '@types/node': '^20.5.7',
      '@typescript-eslint/eslint-plugin': '^6.5.0',
      '@typescript-eslint/parser': '^6.5.0',
      '@vitest/coverage-v8': '^0.34.3',
      'auto-changelog': '^2.4.0',
      'eslint-config-prettier': '^9.0.0',
      'release-it': '^16.1.5',
      eslint: '^8.48.0',
      prettier: '^3.0.3',
      rimraf: '^5.0.1',
      tsup: '^7.2.0',
      typescript: '^5.2.2',
      vitest: '^0.34.3',
      ...(config.viteExample ? { vite: '^4.4.9' } : {}),
      ...(config.additionalDevDependencies ?? {}),
      ...(config.react
        ? {
            '@testing-library/jest-dom': '^6.1.2',
            '@testing-library/react': '^14.0.0',
            '@testing-library/user-event': '^14.4.3',
            '@types/react-dom': '^18.2.7',
            '@types/react': '^18.2.21',
            '@types/testing-library__jest-dom': '^6.0.0',
            '@vitejs/plugin-react': '^4.0.4',
            'eslint-plugin-react-hooks': '^4.6.0',
            'react-dom': '^18.2.0',
            jsdom: '^22.1.0',
            react: '^18.2.0',
          }
        : undefined),
      ...(config.scripts
        ? {
            tsx: '^3.12.8',
            esbuild: '^0.19.2',
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
      git: {
        changelog: 'pnpm run --silent changelog',
      },
      github: {
        release: true,
        web: true,
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

import { PkgStack } from '../logic/PkgStack';
import { IPackageJsonFixed } from '../logic/packageJson';
import { prettierConfig } from '../logic/prettierConfig';
import { DldcConfigKey } from '../tasks/readDldcConfig';
import { PackageJsonKey } from '../tasks/readPackageJson';
import { createEslintConfig } from './createEslintConfig';

export function createPackageJson(pkg: PkgStack): IPackageJsonFixed {
  const prevPackageJson = pkg.getOrFail(PackageJsonKey.Consumer);
  const dldcConfig = pkg.getOrFail(DldcConfigKey.Consumer);
  const prevScriptsScripts = Object.fromEntries(
    Object.entries(prevPackageJson.scripts ?? {}).filter(([key]) => key.startsWith('script:')),
  );
  const additionalDevDependencies = Object.fromEntries(
    Object.entries(prevPackageJson.devDependencies ?? {}).filter(([key]) =>
      dldcConfig.additionalDevDependencies.includes(key),
    ),
  );

  return {
    name: getPackageName(pkg),
    version: prevPackageJson.version,
    description: prevPackageJson.description,
    keywords: prevPackageJson.keywords,
    homepage: `https://github.com/${pkg.base.org}/${pkg.base.repository}#readme`,
    bugs: {
      url: `https://github.com/${pkg.base.org}/${pkg.base.repository}/issues`,
    },
    repository: {
      type: 'git',
      url: `git+https://github.com/${pkg.base.org}/${pkg.base.repository}.git`,
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
      ...(dldcConfig.viteExample ? { 'example:run': 'vite example' } : undefined),
      ...(dldcConfig.scripts ? prevScriptsScripts : undefined),
    },
    dependencies: prevPackageJson.dependencies,
    peerDependencies: prevPackageJson.peerDependencies,
    devDependencies: {
      '@types/node': '^20.7.0',
      '@typescript-eslint/eslint-plugin': '^6.7.3',
      '@typescript-eslint/parser': '^6.7.3',
      '@vitest/coverage-v8': '^0.34.5',
      'auto-changelog': '^2.4.0',
      'eslint-config-prettier': '^9.0.0',
      'release-it': '^16.2.0',
      eslint: '^8.50.0',
      prettier: '^3.0.3',
      rimraf: '^5.0.1',
      tsup: '^7.2.0',
      typescript: '^5.2.2',
      vitest: '^0.34.5',
      ...(dldcConfig.viteExample ? { vite: '^4.4.9' } : {}),
      ...(prevPackageJson.peerDependencies ?? {}),
      ...additionalDevDependencies,
      ...(dldcConfig.react
        ? {
            '@testing-library/jest-dom': '^6.1.3',
            '@testing-library/react': '^14.0.0',
            '@testing-library/user-event': '^14.5.1',
            '@types/react-dom': '^18.2.7',
            '@types/react': '^18.2.22',
            '@vitejs/plugin-react': '^4.1.0',
            'eslint-plugin-react-hooks': '^4.6.0',
            'react-dom': '^18.2.0',
            jsdom: '^22.1.0',
            react: '^18.2.0',
          }
        : undefined),
      ...(dldcConfig.scripts
        ? {
            tsx: '^3.12.10',
            esbuild: '^0.19.3',
          }
        : undefined),
    },
    packageManager: 'pnpm@8.6.1',
    publishConfig: {
      access: 'public',
      registry: 'https://registry.npmjs.org',
    },
    eslintConfig: createEslintConfig(dldcConfig),
    dldc: prevPackageJson.dldc,
    prettier: prettierConfig,
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

function getPackageName(pkg: PkgStack): string {
  if (pkg.base.org === 'dldc-packages') {
    return `@dldc/${pkg.base.repository}`;
  }
  return `@${pkg.base.org}/${pkg.base.repository}`;
}

import { PkgStack } from '../logic/PkgStack';
import { IPackageJsonFixed } from '../logic/packageJson';
import { DevDepsKey } from '../tasks/checkDependencies';
import { DldcConfigKey } from '../tasks/readDldcConfig';
import { PackageJsonKey } from '../tasks/readPackageJson';

export function createPackageJson(pkg: PkgStack): IPackageJsonFixed {
  const prevPackageJson = pkg.getOrFail(PackageJsonKey.Consumer);
  const dldcConfig = pkg.getOrFail(DldcConfigKey.Consumer);
  const prevScriptsScripts = Object.fromEntries(
    Object.entries(prevPackageJson.scripts ?? {}).filter(([key]) => key.startsWith('script:')),
  );
  const devDependencies = pkg.getOrFail(DevDepsKey.Consumer);

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
    packageManager: 'pnpm@9.0.6',
    license: 'MIT',
    author: 'Etienne Dldc <e.deladonchamps@gmail.com>',
    sideEffects: false,
    type: 'module',
    exports: {
      '.': {
        types: './dist/mod.d.ts',
        import: './dist/mod.js',
        require: './dist/mod.cjs',
      },
    },
    main: './dist/mod.js',
    types: './dist/mod.d.ts',
    files: ['dist'],
    scripts: {
      build: 'rimraf dist && tsup --format cjs,esm src/mod.ts --dts',
      'build:watch': 'tsup --watch --format cjs,esm src/mod.ts --dts',
      lint: 'prettier . --check && eslint . && tsc --noEmit',
      'lint:fix': 'prettier . --write . && eslint . --fix',
      release: 'release-it --only-version',
      test: 'pnpm run lint && vitest run --coverage',
      'test:run': 'vitest run',
      'test:watch': 'vitest --watch',
      'test:watch:coverage': 'vitest --watch --coverage',
      changelog:
        'auto-changelog --stdout --hide-credit true --commit-limit false -u --template https://raw.githubusercontent.com/release-it/release-it/main/templates/changelog-compact.hbs',
      typecheck: 'tsc',
      'typecheck:watch': 'tsc --watch',
      ...(dldcConfig.viteExample ? { 'example:run': 'vite example' } : undefined),
      ...(dldcConfig.scripts ? prevScriptsScripts : undefined),
    },
    dependencies: prevPackageJson.dependencies,
    peerDependencies: prevPackageJson.peerDependencies,
    devDependencies,
    publishConfig: {
      access: 'public',
      registry: 'https://registry.npmjs.org',
    },
  };
}

function getPackageName(pkg: PkgStack): string {
  if (pkg.base.org === 'dldc-packages') {
    return `@dldc/${pkg.base.repository}`;
  }
  return `@${pkg.base.org}/${pkg.base.repository}`;
}

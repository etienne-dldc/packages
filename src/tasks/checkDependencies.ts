import { Key } from '@dldc/stack';
import pc from 'picocolors';
import { PkgStack } from '../logic/PkgStack';
import { RETRY } from '../utils/pipeIfWithRetry';
import { DldcConfigKey } from './readDldcConfig';
import { PackageJsonKey } from './readPackageJson';

export const DevDepsKey = Key.create<Record<string, string>>('DevDeps');

export async function checkDependencies(pkg: PkgStack): Promise<PkgStack> {
  const dldcConfig = pkg.getOrFail(DldcConfigKey.Consumer);
  const prevPackageJson = pkg.getOrFail(PackageJsonKey.Consumer);
  const { logger } = pkg.base;

  const devDependenciesKeys = new Set([
    // eslint
    '@eslint/js',
    'eslint',
    'typescript-eslint',
    // vitest
    'vitest',
    '@vitest/coverage-v8',
    // other
    'typescript',
    '@types/node',
    'auto-changelog',
    'release-it',
    'prettier',
    'rimraf',
    'tsup',
    ...(dldcConfig.viteExample ? ['vite'] : []),
    ...Object.keys(prevPackageJson.peerDependencies ?? {}),
    ...dldcConfig.additionalDevDependencies,
    ...(dldcConfig.react
      ? [
          '@testing-library/jest-dom',
          '@testing-library/react',
          '@testing-library/user-event',
          '@types/react-dom',
          '@types/react',
          '@vitejs/plugin-react',
          'eslint-plugin-react-hooks',
          'react-dom',
          'jsdom',
          'react',
        ]
      : []),
    ...(dldcConfig.scripts ? ['tsx', 'esbuild'] : []),
  ]);

  const devDependencies = Object.fromEntries(
    Object.entries(prevPackageJson.devDependencies ?? {}).filter(([key]) => devDependenciesKeys.has(key)),
  );

  // Missing devDeps
  const currentDevDeps = new Set(Object.keys(devDependencies));
  const missingDevDeps: string[] = [];

  devDependenciesKeys.forEach((expectedKey) => {
    if (!currentDevDeps.has(expectedKey)) {
      missingDevDeps.push(expectedKey);
    }
  });

  if (missingDevDeps.length > 0) {
    logger.log(`${pc.red('◆')} Missing devDependencies: ${missingDevDeps.join(', ')}`);
    logger.log(pc.gray(`  pnpm add -D ${missingDevDeps.join(' ')}`));
    throw RETRY;
  }
  return pkg.with(DevDepsKey.Provider(devDependencies));
}

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
    '@types/node',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    '@vitest/coverage-v8',
    'auto-changelog',
    'eslint-config-prettier',
    'release-it',
    'eslint',
    'prettier',
    'rimraf',
    'tsup',
    'typescript',
    'vitest',
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
    throw RETRY;
  }
  return pkg.with(DevDepsKey.Provider(devDependencies));
}

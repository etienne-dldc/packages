import { Key } from '@dldc/stack';
import { readJson } from 'fs-extra';
import { resolve } from 'path';
import pc from 'picocolors';
import { z } from 'zod';
import { PkgStack } from '../logic/PkgStack';
import { IPackageJsonFixed } from '../logic/packageJson';
import { RETRY } from '../utils/pipeIfWithRetry';

const DldcConfigSchema = z.strictObject({
  additionalDevDependencies: z.array(z.string()).optional(),
  react: z.boolean().optional(), // add eslint-plugin-react-hooks, enable jsx in tsconfig
  viteExample: z.boolean().optional(), // example folder with vite
  vitestSetupFile: z.boolean().optional(), // add setup file for vitest
  scripts: z.boolean().optional(), // add scripts to package.json (and install tsx)
  // disable threads for vitest (used by draaw)
  // needed for canvas https://github.com/vitest-dev/vitest/issues/740
  vitestSingleThread: z.boolean().optional(),
  skipLibCheck: z.boolean().optional(), // add skipLibCheck to tsconfig
  gitignore: z.array(z.string()).optional(), // add to .gitignore
  keep: z.array(z.string()).optional(), // files / folders to keep
});

export type IDldcConfig = z.infer<typeof DldcConfigSchema>;

export type IDldcConfigResolved = Required<z.infer<typeof DldcConfigSchema>>;

export const PackageJsonKey = Key.create<IPackageJsonFixed>('PackageJson');

/**
 * Read package.json and validate dldc config
 */
export async function readPackageJson(pkg: PkgStack): Promise<PkgStack> {
  const logger = pkg.base.logger;
  let packageJson: IPackageJsonFixed;
  packageJson = (await readJson(resolve(pkg.base.folder, 'package.json'))) as IPackageJsonFixed;
  const dldcConfig = DldcConfigSchema.safeParse(packageJson.dldc ?? {});
  if (!dldcConfig.success) {
    logger.log(`${pc.red('◆')} Invalid "dldc" config in package.json`);
    logger.log(`${pc.red('◆')} ${dldcConfig.error.message}`);
    throw RETRY;
  }
  logger.log(`${pc.blue('◆')} Valid package.json`);
  return pkg.with(PackageJsonKey.Provider(packageJson));
}

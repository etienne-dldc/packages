import { Key } from '@dldc/stack';
import { existsSync, readJson } from 'fs-extra';
import { resolve } from 'path';
import pc from 'picocolors';
import { z } from 'zod';
import { PkgStack } from '../logic/PkgStack';
import { RETRY } from '../utils/pipeIfWithRetry';

const DldcConfigSchema = z.strictObject({
  additionalDevDependencies: z.array(z.string()).optional(),
  react: z.boolean().optional(), // add eslint-plugin-react-hooks, enable jsx in tsconfig
  viteExample: z.boolean().optional(), // example folder with vite
  vitestSetupFile: z.boolean().optional(), // add setup file for vitest
  scripts: z.boolean().optional(), // add scripts to package.json (and install tsx)
  // disable threads for vitest (used by @dldc/canvas)
  // needed for canvas https://github.com/vitest-dev/vitest/issues/740
  vitestSingleThread: z.boolean().optional(),
  skipLibCheck: z.boolean().optional(), // add skipLibCheck to tsconfig
  gitignore: z.array(z.string()).optional(), // stuff to add to .gitignore
  keep: z.array(z.string()).optional(), // files / folders to keep
  monorepo: z.array(z.string()).optional().nullable(), // monorepo packages glob
});

export type IDldcConfig = z.infer<typeof DldcConfigSchema>;

export type IDldcConfigResolved = Required<z.infer<typeof DldcConfigSchema>>;

const DEFAULT_DLDC_CONFIG: IDldcConfigResolved = {
  additionalDevDependencies: [],
  react: false,
  viteExample: false,
  vitestSetupFile: false,
  vitestSingleThread: false,
  scripts: false,
  skipLibCheck: false,
  gitignore: [],
  keep: [],
  monorepo: null,
};

export const DldcConfigKey = Key.create<IDldcConfigResolved>('DldcConfig');

export async function readDldcConfig(pkg: PkgStack): Promise<PkgStack> {
  const logger = pkg.base.logger;
  const dldcConfigPath = resolve(pkg.base.folder, '.dldc.json');
  if (!existsSync(dldcConfigPath)) {
    logger.log(`${pc.blue('◆')} No .dldc.json file found`);
    return pkg.with(DldcConfigKey.Provider(DEFAULT_DLDC_CONFIG));
  }
  const content = await readJson(resolve(pkg.base.folder, '.dldc.json'));
  const dldcConfig = DldcConfigSchema.safeParse(content);
  if (!dldcConfig.success) {
    logger.log(`${pc.red('◆')} Invalid "dldc" config in package.json`);
    logger.log(`${pc.red('◆')} ${dldcConfig.error.message}`);
    throw RETRY;
  }
  logger.log(`${pc.blue('◆')} Valid .dldc.json file found`);
  const dldcConfigResolved: IDldcConfigResolved = { ...DEFAULT_DLDC_CONFIG, ...dldcConfig.data };
  return pkg.with(DldcConfigKey.Provider(dldcConfigResolved));
}

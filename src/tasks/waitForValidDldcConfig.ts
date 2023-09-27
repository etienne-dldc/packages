import { z } from 'zod';
import { IPkgUtilsBase } from '../logic/pkgUtils';
import { ILogger } from '../utils/logger';

const DldcConfigSchema = z.strictObject({
  additionalDevDependencies: z.record(z.string()).optional(),
  react: z.boolean().optional(), // add eslint-plugin-react-hooks, enable jsx in tsconfig
  viteExample: z.boolean().optional(), // example folder with vite
  vitestSetupFile: z.boolean().optional(), // add setup file for vitest
  scripts: z.boolean().optional(), // add scripts to package.json (and install tsx)
  // disable threads for vitest (used by draaw)
  // needed for canvas https://github.com/vitest-dev/vitest/issues/740
  vitestNoThreads: z.boolean().optional(),
  skipLibCheck: z.boolean().optional(), // add skipLibCheck to tsconfig
  gitignore: z.array(z.string()).optional(), // add to .gitignore
  keep: z.array(z.string()).optional(), // files / folders to keep
});

export type IDldcConfig = Required<z.infer<typeof DldcConfigSchema>>;

const DEFAULT_CONFIG: IDldcConfig = {
  additionalDevDependencies: {},
  react: false,
  viteExample: false,
  vitestSetupFile: false,
  vitestNoThreads: false,
  scripts: false,
  skipLibCheck: false,
  gitignore: [],
  keep: [],
};

export async function waitForValidDldcConfig(logger: ILogger, pkg: IPkgUtilsBase): Promise<IPkgUtilsBase> {
  logger.log(`TODO Validate dldc config`);
  return pkg;
}

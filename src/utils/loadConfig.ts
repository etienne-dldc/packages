import { readFile } from 'fs-extra';
import { parse as parseJSONC } from 'jsonc-parser';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import pc from 'picocolors';
import { z } from 'zod';
import { ILogger } from './logger';

const ConfigSchema = z.strictObject({
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

export type IConfig = Required<z.infer<typeof ConfigSchema>>;

const DEFAULT_CONFIG: IConfig = {
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

export async function loadConfig(logger: ILogger, folder: string): Promise<IConfig | null> {
  const configPath = resolve(folder, 'config.json');
  if (!existsSync(configPath)) {
    return {
      ...DEFAULT_CONFIG,
    };
  }
  try {
    const configStr = await readFile(configPath, 'utf-8');
    const config = ConfigSchema.parse(parseJSONC(configStr));
    const loadedConfig = { ...DEFAULT_CONFIG, ...config };
    logger.log(`Loaded config file`);
    return loadedConfig;
  } catch (error) {
    logger.log(`${pc.red('◆')} Error loading config file`);
    logger.log((error as z.ZodError).message);
    return null;
  }
}

import { readJson } from 'fs-extra';
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
  // disable threads for vitest (used by draaw)
  // needed for canvas https://github.com/vitest-dev/vitest/issues/740
  vitestNoThreads: z.boolean().optional(),
});

export type IConfig = Required<z.infer<typeof ConfigSchema>>;

const DEFAULT_CONFIG: IConfig = {
  additionalDevDependencies: {},
  react: false,
  viteExample: false,
  vitestSetupFile: false,
  vitestNoThreads: false,
};

export async function loadConfig(logger: ILogger, folder: string): Promise<IConfig> {
  const configPath = resolve(folder, 'config.json');
  if (!existsSync(configPath)) {
    return {
      ...DEFAULT_CONFIG,
    };
  }
  try {
    const config = ConfigSchema.parse(await readJson(configPath));
    logger.log(`Loaded config file`);
    return { ...DEFAULT_CONFIG, ...config };
  } catch (error) {
    logger.log(`${pc.red('◆')} Error loading config file`);
    throw error;
  }
}

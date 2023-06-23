import { readJson } from 'fs-extra';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import pc from 'picocolors';
import { z } from 'zod';
import { ILogger } from './logger';

const ConfigSchema = z.object({
  additionalDevDependencies: z.record(z.string()).optional(),
  browser: z.boolean().optional(), // Add types for browser (DOM)
  react: z.boolean().optional(), // add eslint-plugin-react-hooks, enable jsx in tsconfig
  viteExample: z.boolean().optional(), // example folder with vite
});

export type IConfig = Required<z.infer<typeof ConfigSchema>>;

const DEFAULT_CONFIG: IConfig = {
  additionalDevDependencies: {},
  browser: false,
  react: false,
  viteExample: false,
};

export async function loadConfig(logger: ILogger, folder: string): Promise<IConfig> {
  const configPath = resolve(folder, 'config.json');
  if (!existsSync(configPath)) {
    return {
      ...DEFAULT_CONFIG,
    };
  }
  try {
    const config = await ConfigSchema.parseAsync(await readJson(configPath));
    logger.log(`Loaded config file`);
    return { ...DEFAULT_CONFIG, ...config };
  } catch (error) {
    logger.log(`${pc.red('◆')} Error loading config file`);
    throw error;
  }
}

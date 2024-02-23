import expandBase from '@inquirer/expand';
import { ILogger } from '../utils/logger';

type ExpandChoice<T extends string> = { key: string; name: string; value: T };

interface ExpandConfig<T extends string> {
  message: string;
  choices: ReadonlyArray<ExpandChoice<T>>;
  default?: string;
  expanded?: boolean;
}

export async function expand<T extends string>(logger: ILogger, config: ExpandConfig<T>): Promise<T> {
  const result = await expandBase({
    ...config,
    theme: {
      prefix: logger.prefix,
    },
  });
  return result as T;
}

import expandBase from '@inquirer/expand';
import { ILogger } from '../utils/logger';

type ExpandChoice<T extends string> =
  | { key: T; name: string }
  | { key: T; value: string }
  | { key: T; name: string; value: string };

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

import selectBase, { Separator } from '@inquirer/select';
import { ILogger } from '../utils/logger';

interface Choice<Value> {
  value: Value;
  name?: string;
  description?: string;
  disabled?: boolean | string;
  type?: never;
}

interface SelectConfig<Value> {
  message: string;
  choices: readonly (Separator | Choice<Value>)[];
  pageSize?: number | undefined;
  loop?: boolean | undefined;
  default?: unknown;
}

export function select<Value>(logger: ILogger, config: SelectConfig<Value>): Promise<Value> {
  return selectBase({
    ...config,
    theme: {
      prefix: logger.prefix,
    },
  });
}

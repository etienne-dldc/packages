import confirmBase from '@inquirer/confirm';
import { ILogger } from '../utils/logger';

interface ConfirmConfig {
  default?: boolean;
  message: string;
}

export function confirm(logger: ILogger, config: ConfirmConfig): Promise<boolean> {
  return confirmBase({
    ...config,
    theme: {
      prefix: logger.prefix,
    },
  });
}

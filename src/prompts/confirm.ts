import { createPrompt, isEnterKey, useKeypress, useState } from '@inquirer/core';
import pc from 'picocolors';
import { ILogger } from '../utils/logger';

interface ConfirmConfig {
  logger: ILogger;
  default?: boolean;
  message: string;
}

const createConfirm = createPrompt<boolean, ConfirmConfig>(
  ({ message: rawMessage, logger, default: defaultAnswer }, done) => {
    const [status, setStatus] = useState('pending');
    const [value, setValue] = useState('');

    useKeypress((key, rl) => {
      if (isEnterKey(key)) {
        let answer = defaultAnswer !== false;
        if (/^(y|yes)/i.test(value)) answer = true;
        else if (/^(n|no)/i.test(value)) answer = false;

        setValue(answer ? 'yes' : 'no');
        setStatus('done');
        done(answer);
      } else {
        setValue(rl.line);
      }
    });

    let formattedValue = value;
    let defaultValue = '';
    if (status === 'done') {
      formattedValue = pc.cyan(value);
    } else {
      defaultValue = pc.dim(defaultAnswer === false ? ' (y/N)' : ' (Y/n)');
    }

    const message = pc.bold(rawMessage);
    return logger.format(`${message}${defaultValue} ${formattedValue}`);
  },
);

export function confirm(config: ConfirmConfig): Promise<boolean> {
  return createConfirm(config);
}

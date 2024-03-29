import inputBase from '@inquirer/input';
import { ILogger } from '../utils/logger';

interface InputConfig {
  message: string;
  default?: string;
  validate?: (value: string) => boolean | string | Promise<string | boolean>;
}

export function input(logger: ILogger, config: InputConfig): Promise<string> {
  return inputBase({
    ...config,
    theme: {
      prefix: logger.prefix,
    },
  });
}

// import {
//   createPrompt,
//   isBackspaceKey,
//   isEnterKey,
//   useKeypress,
//   usePrefix,
//   useState,
// } from '@inquirer/core';
// import pc from 'picocolors';
// import { ILogger } from '../utils/logger';

// export interface InputConfig {
//   message: string;
//   logger: ILogger;
//   default?: string;
//   transformer?: (value: string, { isFinal }: { isFinal: boolean }) => string;
//   validate?: (value: string) => boolean | string | Promise<string | boolean>;
// }

// export const input = createPrompt<string, InputConfig>((config, done) => {
//   const { validate = () => true, logger } = config;
//   const [status, setStatus] = useState<string>('pending');
//   const [defaultValue = '', setDefaultValue] = useState<string | undefined>(config.default);
//   const [errorMsg, setError] = useState<string | undefined>(undefined);
//   const [value, setValue] = useState<string>('');

//   const isLoading = status === 'loading';
//   const prefix = usePrefix({ isLoading });

//   useKeypress(async (key, rl) => {
//     // Ignore keypress while our prompt is doing other processing.
//     if (status !== 'pending') {
//       return;
//     }

//     if (isEnterKey(key)) {
//       const answer = value || defaultValue;
//       setStatus('loading');
//       const isValid = await validate(answer);
//       if (isValid === true) {
//         setValue(answer);
//         setStatus('done');
//         done(answer);
//       } else {
//         // Reset the readline line value to the previous value. On line event, the value
//         // get cleared, forcing the user to re-enter the value instead of fixing it.
//         rl.write(value);
//         setError(isValid || 'You must provide a valid value');
//         setStatus('pending');
//       }
//     } else if (isBackspaceKey(key) && !value) {
//       setDefaultValue(undefined);
//     } else if (key.name === 'tab' && !value) {
//       setDefaultValue(undefined);
//       rl.clearLine(0); // Remove the tab character.
//       rl.write(defaultValue);
//       setValue(defaultValue);
//     } else {
//       setValue(rl.line);
//       setError(undefined);
//     }
//   });

//   const message = pc.bold(config.message);
//   let formattedValue = value;
//   if (typeof config.transformer === 'function') {
//     formattedValue = config.transformer(value, { isFinal: status === 'done' });
//   }
//   if (status === 'done') {
//     formattedValue = pc.cyan(formattedValue);
//   }

//   let defaultStr = '';
//   if (defaultValue && status !== 'done' && !value) {
//     defaultStr = pc.dim(` (${defaultValue})`);
//   }

//   let error = '';
//   if (errorMsg) {
//     error = pc.red(`> ${errorMsg}`);
//   }

//   return [logger.format(`${prefix} ${message}${defaultStr} ${formattedValue}`), logger.format(error)];
// });

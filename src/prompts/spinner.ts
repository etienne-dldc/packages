import { AsyncPromptConfig, createPrompt, useEffect, useRef, useState } from '@inquirer/core';
import pc from 'picocolors';

const frames = ['◒', '◐', '◓', '◑'];

interface SpinnerConfig<T> extends AsyncPromptConfig {
  promise: Promise<T>;
}

const createSpinner = createPrompt<any, SpinnerConfig<any>>((config, done) => {
  const [step, setStep] = useState(0);
  const stepRef = useRef(step);
  const [result, setResult] = useState<null | { status: 'success'; result: any } | { status: 'error'; error: any }>(
    null
  );

  useEffect(() => {
    const timer = setInterval(() => {
      stepRef.current = (stepRef.current + 1) % frames.length;
      setStep(stepRef.current);
    }, 80);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    config.promise.then(
      (result) => setResult({ status: 'success', result }),
      (error) => setResult({ status: 'error', error })
    );
  }, []);

  useEffect(() => {
    if (!result) {
      return;
    }
    if (result.status === 'success') {
      setTimeout(() => {
        done(result.result);
      }, 10);
      return;
    }
    throw result.error;
  }, [result]);

  if (result === null) {
    return `${pc.magenta(frames[step])} ${config.message}`;
  }
  if (result.status === 'success') {
    return `${pc.green('✔')} ${config.message}`;
  }
  return `${pc.red('✖')} ${config.message}`;
});

export function spinner<T>(config: SpinnerConfig<T>): Promise<T> {
  return createSpinner(config);
}

// () => {

// let unblock: () => void;
// let loop: NodeJS.Timer;
// const delay = 80;
// return {
//   start(message = "") {
//     message = message.replace(/\.?\.?\.$/, "");
//     unblock = block();
//     process.stdout.write(`\n${color.magenta("○")}  ${message}\n`);
//     let i = 0;
//     let dot = 0;
//     loop = setInterval(() => {
//       let frame = frames[i];
//       process.stdout.write(cursor.move(-999, -1));
//       process.stdout.write(
//         `${color.magenta(frame)}  ${message}${
//           Math.floor(dot) >= 1 ? ".".repeat(Math.floor(dot)).slice(0, 3) : ""
//         }   \n`
//       );
//       i = i === frames.length - 1 ? 0 : i + 1;
//       dot = dot === frames.length ? 0 : dot + 0.125;
//     }, delay);
//   },
//   stop(message = "") {
//     process.stdout.write(cursor.move(-999, -2));
//     process.stdout.write(erase.down(2));
//     clearInterval(loop);
//     process.stdout.write(`\n${color.green(S_STEP_SUBMIT)}  ${message}\n`);
//     unblock();
//   },
// };
// };

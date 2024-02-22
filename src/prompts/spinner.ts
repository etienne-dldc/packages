import { createPrompt, useEffect, useRef, useState } from '@inquirer/core';
import pc from 'picocolors';

const frames = ['◒', '◐', '◓', '◑'];

interface SpinnerConfig<T> {
  message: string;
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

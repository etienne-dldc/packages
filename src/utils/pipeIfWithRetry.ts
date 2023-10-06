import { pipeIf } from './pipeIf';

export const RETRY = Symbol('RETRY');
export const RETRY_NOW = Symbol('RETRY_NOW');

export interface IPipeIfWithRetryConfig<T> {
  condition: (value: T) => boolean;
  steps: (((value: T) => Promise<T> | T) | null)[];
  onRetry: (item: T) => Promise<void>;
}

export async function pipeIfWithRetry<T>(
  values: T[],
  { condition, steps, onRetry }: IPipeIfWithRetryConfig<T>,
): Promise<T[]> {
  const results: T[] = [];
  for (const value of values) {
    while (true) {
      try {
        const result = await pipeIf(value, { condition, steps });
        results.push(result);
        break;
      } catch (error) {
        if (error === RETRY_NOW) {
          continue;
        }
        if (error === RETRY) {
          await onRetry(value);
          continue;
        }
        throw error;
      }
    }
  }
  return results;
}

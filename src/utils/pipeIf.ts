export interface IPipeIfConfig<T> {
  condition: (value: T) => boolean;
  steps: (((value: T) => Promise<T> | T) | null)[];
}

export async function pipeIf<T>(value: T, { condition, steps }: IPipeIfConfig<T>): Promise<T> {
  let current: T = value;
  for (const callback of steps) {
    if (!callback) {
      continue;
    }
    if (!condition(current)) {
      return current;
    }
    current = await callback(current);
  }
  return current;
}

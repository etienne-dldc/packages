export interface IPipeArrayIfConfig<T> {
  initial: T[];
  condition: (value: T) => boolean;
  steps: ((value: T) => Promise<T> | T)[];
}

export async function pipeArrayIf<T>({ initial, condition, steps }: IPipeArrayIfConfig<T>): Promise<T[]> {
  const result: T[] = [];
  item: for (const value of initial) {
    let current: T = value;
    for (const callback of steps) {
      if (!condition(current)) {
        break item;
      }
      current = await callback(current);
    }
    result.push(current);
  }
  return result;
}

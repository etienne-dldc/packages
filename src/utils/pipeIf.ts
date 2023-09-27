export async function pipeIf<T>(
  value: T,
  condition: (value: T) => boolean,
  ...callbacks: ((value: T) => Promise<T> | T)[]
): Promise<T> {
  let current: T = value;
  for (const callback of callbacks) {
    if (!condition(current)) {
      return current;
    }
    current = await callback(current);
  }
  return current;
}

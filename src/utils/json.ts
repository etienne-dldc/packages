const IS_RAW = Symbol('IS_RAW');

interface IRawItem {
  [IS_RAW]: true;
  value: string;
}

function print(obj: any): string {
  if (obj && obj[IS_RAW]) {
    return obj.value;
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(print).join(', ')}]`;
  }
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || obj === null) {
    return JSON.stringify(obj);
  }
  const entries = Object.entries(obj).filter(([, value]) => value !== undefined);
  return [
    '{' + (entries.length === 1 ? '' : '\n'),
    entries.map(([key, value]) => `${JSON.stringify(key)}: ${print(value)}`).join(','),
    '}',
  ].join('');
}

export function raw(value: string): IRawItem {
  return { [IS_RAW]: true, value };
}

export const json = Object.assign(print, { raw });

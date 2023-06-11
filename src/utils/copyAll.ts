import { cp, readdir } from 'fs/promises';
import { resolve } from 'path';

/**
 * Copy each file from source to dest
 */
export async function copyAll(source: string, dest: string) {
  const files = await readdir(source);
  for (const file of files) {
    await cp(resolve(source, file), resolve(dest, file), { recursive: true });
  }
}

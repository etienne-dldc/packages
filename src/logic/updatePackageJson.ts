import { readFile } from 'fs/promises';
import { resolve } from 'path';
import sortPackageJson from 'sort-package-json';
import { saveFile } from '../utils/saveFile';

export async function updatePackageJson(folder: string, update: (pkg: any) => any | false) {
  const packageJsonPath = resolve(folder, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
  const result = update(packageJson);
  if (result === false) {
    return;
  }
  await saveFile(folder, 'package.json', sortPackageJson(JSON.stringify(result, null, 2)));
}

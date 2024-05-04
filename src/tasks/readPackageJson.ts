import { Key } from '@dldc/stack';
import { readJson } from 'fs-extra';
import { resolve } from 'path';
import { PkgStack } from '../logic/PkgStack';
import { IPackageJsonFixed } from '../logic/packageJson';

export const PackageJsonKey = Key.create<IPackageJsonFixed>('PackageJson');

/**
 * Read package.json
 */
export async function readPackageJson(pkg: PkgStack): Promise<PkgStack> {
  const packageJson = (await readJson(resolve(pkg.base.folder, 'package.json'))) as IPackageJsonFixed;
  return pkg.with(PackageJsonKey.Provider(packageJson));
}

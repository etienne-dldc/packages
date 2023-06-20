import { relative, resolve } from 'path';
import pc from 'picocolors';
import { IPackage } from '../packages';

export function pkgUtils(pkg: IPackage) {
  const pkgName = `${pc.blue(pkg.org)}/${pc.green(pkg.name)}`;
  const baseDir = resolve(`${process.env.HOME}/Workspace`);
  const folder = resolve(baseDir, `github.com/${pkg.org}/${pkg.name}`);
  const prefix = ` ${pc.gray('│')} `;
  const relativeFolder = relative(baseDir, folder);
  return {
    prefix,
    folder,
    relativeFolder,
    pkgName,
  };
}

import { $, Execa$ } from 'execa';
import { readJson } from 'fs-extra';
import { relative, resolve } from 'path';
import pc from 'picocolors';
import { PackageJsonFixed } from '../generate/createPackageJson';
import { IPackage, Org } from '../packages';
import { IDldcConfig } from './loadDldcConfig';

export interface IPkgUtilsBase {
  readonly repository: string;
  readonly org: Org;
  readonly disabled: boolean;
  readonly prefix: string;
  readonly folder: string;
  readonly relativeFolder: string;
  readonly pkgName: string;
  readonly $$: Execa$;
}

export function pkgUtilsBase(pkg: IPackage): IPkgUtilsBase {
  const pkgName = `${pc.blue(pkg.org)}/${pc.green(pkg.repository)}`;
  const baseDir = resolve(`${process.env.HOME}/Workspace`);
  const folder = resolve(baseDir, `github.com/${pkg.org}/${pkg.repository}`);
  const prefix = ` ${pc.gray('│')} `;
  const relativeFolder = relative(baseDir, folder);
  return {
    ...pkg,
    prefix,
    folder,
    relativeFolder,
    pkgName,
    disabled: pkg.disabled ?? false,
    $$: $({ cwd: folder, verbose: false }),
  };
}

export interface IPkgUtils extends IPkgUtilsBase {
  packageJson: PackageJsonFixed;
  dldcConfig: IDldcConfig;
}

export async function pkgUtils(pkgBase: IPkgUtilsBase): Promise<IPkgUtils> {
  // Load all package.json
  const packageJson = (await readJson(resolve(pkgBase.folder, 'package.json'))) as PackageJsonFixed;
  return { ...pkgBase, packageJson };
}

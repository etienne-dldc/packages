import { PackageJsonKey } from '../tasks/readPackageJson';
import { PkgStack } from './PkgStack';

export async function resolveGraph(pkgs: PkgStack[]): Promise<PkgStack[]> {
  const pkgPackageJson = new Map(
    pkgs.map((pkg) => {
      const packageJson = pkg.getOrFail(PackageJsonKey.Consumer);
      return [pkg, packageJson] as const;
    }),
  );
  const packagesNames = pkgs.map((pkg) => pkgPackageJson.get(pkg)!.name);
  const allDependencies = new Map<string, Set<string>>();
  function resolvePkg(pkgName: string): Set<string> {
    const resolved = allDependencies.get(pkgName);
    if (resolved) {
      return resolved;
    }
    const pkg = pkgs.find((pkg) => pkgPackageJson.get(pkg)!.name === pkgName)!;
    const deps = Object.keys(pkgPackageJson.get(pkg)!.dependencies ?? {}).filter((dep) => packagesNames.includes(dep));
    const all = deps.reduce((acc, dep) => {
      const depDeps = resolvePkg(dep);
      depDeps.forEach((depDep) => acc.add(depDep));
      return acc;
    }, new Set(deps));
    allDependencies.set(pkgName, all);
    return all;
  }
  pkgs.forEach((pkg) => {
    resolvePkg(pkgPackageJson.get(pkg)!.name);
  });
  return pkgs.sort((a, b) => {
    const aDeps = allDependencies.get(pkgPackageJson.get(a)!.name)!;
    const bDeps = allDependencies.get(pkgPackageJson.get(b)!.name)!;
    if (aDeps.has(pkgPackageJson.get(b)!.name)) {
      return 1;
    }
    if (bDeps.has(pkgPackageJson.get(a)!.name)) {
      return -1;
    }
    return 0;
  });
}

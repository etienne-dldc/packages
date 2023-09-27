import { IPkgUtils } from './pkgUtils';

export async function resolveGraph(pkgs: IPkgUtils[]): Promise<IPkgUtils[]> {
  // // Load all package.json
  // const pkgs = await Promise.all(
  //   pkgsBase.map(async (pkg): Promise<IPgkWithPackageJson> => {
  //     const packageJson = (await readJson(resolve(pkg.folder, 'package.json'))) as PackageJsonFixed;
  //     return { ...pkg, packageJson };
  //   }),
  // );

  const packagesNames = pkgs.map((pkg) => pkg.packageJson.name);
  const allDependencies = new Map<string, Set<string>>();
  function resolvePkg(pkgName: string): Set<string> {
    const resolved = allDependencies.get(pkgName);
    if (resolved) {
      return resolved;
    }
    const pkg = pkgs.find((pkg) => pkg.packageJson.name === pkgName)!;
    const deps = Object.keys(pkg.packageJson.dependencies ?? {}).filter((dep) => packagesNames.includes(dep));
    const all = deps.reduce((acc, dep) => {
      const depDeps = resolvePkg(dep);
      depDeps.forEach((depDep) => acc.add(depDep));
      return acc;
    }, new Set(deps));
    allDependencies.set(pkgName, all);
    return all;
  }
  pkgs.forEach((pkg) => {
    resolvePkg(pkg.packageJson.name);
  });
  return pkgs.sort((a, b) => {
    const aDeps = allDependencies.get(a.packageJson.name)!;
    const bDeps = allDependencies.get(b.packageJson.name)!;
    if (aDeps.has(b.packageJson.name)) {
      return 1;
    }
    if (bDeps.has(a.packageJson.name)) {
      return -1;
    }
    return 0;
  });
}

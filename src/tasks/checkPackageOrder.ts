import { PkgStack } from '../logic/PkgStack';
import { PackageJsonKey } from './readPackageJson';

/**
 * Make sure package are in the right order (dependencies before dependents)
 */
export async function checkPackageOrder(pkgs: PkgStack[]) {
  const pkgPackageJson = new Map(
    pkgs.map((pkg) => {
      const packageJson = pkg.getOrFail(PackageJsonKey.Consumer);
      return [pkg, packageJson] as const;
    }),
  );
  const packagesNames = pkgs.map((pkg) => pkgPackageJson.get(pkg)!.name);
  const prevPackages = new Set<string>();
  pkgs.forEach((pkg) => {
    const deps = Object.keys(pkgPackageJson.get(pkg)!.dependencies ?? {}).filter((dep) => packagesNames.includes(dep));
    deps.forEach((dep) => {
      if (!prevPackages.has(dep)) {
        throw new Error(`Package ${pkgPackageJson.get(pkg)!.name} depends on ${dep} but it is not before`);
      }
    });
    prevPackages.add(pkgPackageJson.get(pkg)!.name);
  });
}

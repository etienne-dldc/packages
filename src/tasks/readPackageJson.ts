import { createKey } from "@dldc/stack";
// import { readJson } from "fs-extra";
import { resolve } from "@std/path";
import { PkgStack } from "../logic/PkgStack.ts";
import { IPackageJsonFixed } from "../logic/packageJson.ts";

export const PackageJsonKey = createKey<IPackageJsonFixed>("PackageJson");

/**
 * Read package.json
 */
export async function readPackageJson(pkg: PkgStack): Promise<PkgStack> {
  const packageJson = JSON.parse(
    await Deno.readTextFile(resolve(pkg.base.folder, "package.json"))
  ) as IPackageJsonFixed;
  return pkg.with(PackageJsonKey.Provider(packageJson));
}

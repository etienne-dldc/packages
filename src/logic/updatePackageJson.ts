import { resolve } from "@std/path";
import sortPackageJson from "sort-package-json";
import { saveFile } from "../utils/saveFile.ts";

export async function updatePackageJson(
  folder: string,
  // deno-lint-ignore no-explicit-any
  update: (pkg: any) => any | false
) {
  const packageJsonPath = resolve(folder, "package.json");
  const packageJson = JSON.parse(await Deno.readTextFile(packageJsonPath));
  const result = update(packageJson);
  if (result === false) {
    return;
  }
  await saveFile(
    folder,
    "package.json",
    sortPackageJson(JSON.stringify(result, null, 2))
  );
}

import { exists } from "@std/fs";
import { $ } from "execa";
import pc from "picocolors";
import { PkgStack } from "../logic/PkgStack.ts";
import { confirm } from "../prompts/confirm.ts";

export async function ensureCloned(pkg: PkgStack): Promise<PkgStack> {
  const gitLink = `git@github.com:${pkg.base.org}/${pkg.base.repository}.git`;
  const logger = pkg.base.logger;

  if (!exists(pkg.base.folder)) {
    const shouldClone = await confirm(logger, {
      message: `Folder ${pc.blue(
        pkg.base.relativeFolder
      )} does not exist. Clone it?`,
    });
    if (!shouldClone) {
      return pkg.skip();
    }
    logger.log(`${pc.blue("◆")} Cloning in ${pkg.base.coloredName}`);
    await $({ verbose: "none" })`git clone -- ${gitLink} ${pkg.base.folder}`;
    logger.log(`${pc.green("◆")} Cloned`);
    return pkg;
  }

  const { stdout: originUrl } = await pkg.base
    .$$`git ls-remote --get-url origin`;
  if (originUrl !== gitLink) {
    logger.log(`${pc.red(originUrl)}`);
    logger.log(`${pc.red("◆")} Wrong origin, skipping`);
    return pkg.skip();
  }
  return pkg;
}

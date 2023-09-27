import { $ } from 'execa';
import { existsSync } from 'fs';
import pc from 'picocolors';
import { IPkgUtilsBase } from '../logic/pkgUtils';
import { confirm } from '../prompts/confirm';
import { ILogger } from '../utils/logger';

export async function ensureCloned(logger: ILogger, pkg: IPkgUtilsBase): Promise<IPkgUtilsBase> {
  const gitLink = `git@github.com:${pkg.org}/${pkg.repository}.git`;

  if (!existsSync(pkg.folder)) {
    const shouldClone = await confirm({
      logger,
      message: `Folder ${pc.blue(pkg.relativeFolder)} does not exist. Clone it?`,
    });
    if (!shouldClone) {
      return { ...pkg, disabled: true };
    }
    logger.log(`${pc.blue('◆')} Cloning in ${pkg.pkgName}`);
    await $({ verbose: false })`git clone -- ${gitLink} ${pkg.folder}`;
    logger.log(`${pc.green('◆')} Cloned`);
    return pkg;
  }

  const { stdout: originUrl } = await pkg.$$`git ls-remote --get-url origin`;
  if (originUrl !== gitLink) {
    logger.log(`${pc.red(originUrl)}`);
    logger.log(`${pc.red('◆')} Wrong origin, skipping`);
    return { ...pkg, disabled: true };
  }
  return pkg;
}

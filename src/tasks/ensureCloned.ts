import { $ } from 'execa';
import { existsSync } from 'fs';
import pc from 'picocolors';
import { PkgStack } from '../logic/PkgStack';
import { confirm } from '../prompts/confirm';

export async function ensureCloned(pkg: PkgStack): Promise<PkgStack> {
  const gitLink = `git@github.com:${pkg.base.org}/${pkg.base.repository}.git`;
  const logger = pkg.base.logger;

  if (!existsSync(pkg.base.folder)) {
    const shouldClone = await confirm(logger, {
      message: `Folder ${pc.blue(pkg.base.relativeFolder)} does not exist. Clone it?`,
    });
    if (!shouldClone) {
      return pkg.skip();
    }
    logger.log(`${pc.blue('◆')} Cloning in ${pkg.base.coloredName}`);
    await $({ verbose: false })`git clone -- ${gitLink} ${pkg.base.folder}`;
    logger.log(`${pc.green('◆')} Cloned`);
    return pkg;
  }

  const { stdout: originUrl } = await pkg.base.$$`git ls-remote --get-url origin`;
  if (originUrl !== gitLink) {
    logger.log(`${pc.red(originUrl)}`);
    logger.log(`${pc.red('◆')} Wrong origin, skipping`);
    return pkg.skip();
  }
  return pkg;
}

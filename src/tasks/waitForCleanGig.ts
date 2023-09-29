import pc from 'picocolors';
import { PkgStack } from '../logic/PkgStack';
import { confirm } from '../prompts/confirm';

interface IConfig {
  silent?: boolean;
}

/**
 * Make sure there are no uncommited changes
 */
export async function waitForCleanGig(pkg: PkgStack, { silent = false }: IConfig = {}): Promise<PkgStack> {
  const logger = pkg.base.logger;

  while (true) {
    const { stdout: gitStatus } = await pkg.base.$$`git status --porcelain --branch`;
    const [branchStatus, ...files] = gitStatus.trim().split('\n');
    const pullPush = branchStatus.replace('## main...origin/main', '').trim();
    if (pullPush === '' && files.length === 0) {
      break;
    }
    const changes = [pullPush, files.length > 0 ? `${files.length} files` : ''].filter(Boolean).join(', ');
    logger.log(`${pc.red('◆')} Repo is not clean (${changes})`);
    const tryAgain = await confirm({ logger, message: `Confirm to try again` });
    if (!tryAgain) {
      return pkg.skip();
    }
  }
  if (!silent) {
    logger.log(`${pc.blue('◆')} Repo is clean`);
  }
  return pkg;
}

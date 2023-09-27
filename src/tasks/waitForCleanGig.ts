import pc from 'picocolors';
import { IPkgUtils } from '../logic/pkgUtils';
import { confirm } from '../prompts/confirm';
import { ILogger } from '../utils/logger';

/**
 * Make sure there are no uncommited changes
 */
export async function waitForCleanGig(logger: ILogger, pkg: IPkgUtils) {
  while (true) {
    const { stdout: gitStatus } = await pkg.$$`git status --porcelain --branch`;
    const [branchStatus, ...files] = gitStatus.trim().split('\n');
    const pullPush = branchStatus.replace('## main...origin/main', '').trim();
    if (pullPush === '' && files.length === 0) {
      break;
    }
    const changes = [pullPush, files.length > 0 ? `${files.length} files` : ''].filter(Boolean).join(', ');
    logger.log(`${pc.red('◆')} Repo is not clean (${changes})`);
    const tryAgain = await confirm({ logger, message: `Confirm to try again` });
    if (!tryAgain) {
      break;
    }
  }
  logger.log(`${pc.blue('◆')} Repo is clean`);
}

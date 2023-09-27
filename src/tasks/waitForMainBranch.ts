import pc from 'picocolors';
import { IPkgUtils } from '../logic/pkgUtils';
import { confirm } from '../prompts/confirm';
import { ILogger } from '../utils/logger';

/**
 * Make sure the current branch is main
 */
export async function waitForMainBranch(logger: ILogger, pkg: IPkgUtils) {
  while (true) {
    const { stdout: branch } = await pkg.$$`git branch --show-current`;
    if (branch.trim() === 'main') {
      break;
    }
    logger.log(`${pc.red('◆')} Not on main branch (current branch is ${pc.green(branch.trim())}) `);
    const tryAgain = await confirm({ logger, message: `Confirm to try again` });
    if (!tryAgain) {
      break;
    }
  }
  logger.log(`${pc.blue('◆')} Is on main branch`);
}

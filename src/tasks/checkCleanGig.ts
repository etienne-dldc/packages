import pc from 'picocolors';
import { PkgStack } from '../logic/PkgStack';
import { RETRY } from '../utils/pipeIfWithRetry';

interface IConfig {
  silent?: boolean;
}

/**
 * Make sure there are no uncommited changes
 */
export async function checkCleanGig(pkg: PkgStack, { silent = false }: IConfig = {}): Promise<PkgStack> {
  const { logger, $$ } = pkg.base;
  const { stdout: branch } = await $$`git branch --show-current`;
  if (branch.trim() !== 'main') {
    logger.log(`${pc.red('◆')} Not on main branch (current branch is ${pc.green(branch.trim())}) `);
    throw RETRY;
  }
  const { stdout: gitStatus } = await $$`git status --porcelain --branch`;
  const [branchStatus, ...files] = gitStatus.trim().split('\n');
  const pullPush = branchStatus.replace('## main...origin/main', '').trim();
  const isClean = pullPush === '' && files.length === 0;
  if (!isClean) {
    const changes = [pullPush, files.length > 0 ? `${files.length} files` : ''].filter(Boolean).join(', ');
    logger.log(`${pc.red('◆')} Repo is not clean (${changes})`);
    throw RETRY;
  }
  if (!silent) {
    logger.log(`${pc.blue('◆')} Repo is clean`);
  }
  return pkg;
}

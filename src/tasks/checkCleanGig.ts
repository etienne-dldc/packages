import pc from 'picocolors';
import { PkgStack } from '../logic/PkgStack';
import { expand } from '../prompts/expand';
import { input } from '../prompts/input';
import { RETRY, RETRY_NOW } from '../utils/pipeIfWithRetry';

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
  if (files.length > 0) {
    logger.log(`${pc.red('◆')} Uncommited changes`);
    const fileLogger = logger.child('  ');
    files.forEach((file) => fileLogger.log(pc.red(file)));
    const action = await expand(logger, {
      message: `Uncommited changes (${files.length} files)`,
      choices: [
        { key: 'r', name: 'Retry', value: 'retry' },
        { key: 's', name: 'Skip', value: 'skip' },
        { key: 'c', name: 'Commit', value: 'commit' },
      ],
    });
    switch (action) {
      case 'retry':
        throw RETRY;
      case 'skip':
        break;
      case 'commit': {
        await commit(pkg);
        throw RETRY_NOW;
      }
    }
  }

  if (pullPush !== '') {
    const action = await expand(logger, {
      message: `${pc.red('◆')} Repo is not clean ${pullPush}`,
      choices: [
        { key: 'r', name: 'Retry', value: 'retry' },
        { key: 's', name: 'Skip', value: 'skip' },
        { key: 'p', name: 'Pull & Push', value: 'pull-push' },
      ],
    });
    switch (action) {
      case 'retry':
        throw RETRY;
      case 'skip':
        break;
      case 'pull-push':
        await pushPull(pkg);
        throw RETRY_NOW;
    }
  }
  if (!silent) {
    logger.log(`${pc.blue('◆')} Repo is clean`);
  }
  return pkg;
}

async function commit(pkg: PkgStack) {
  const { logger, $$ } = pkg.base;
  await $$`git add .`;
  const message = await input(logger, {
    message: 'Commit message',
    default: pkg.globalConfig.lastCommitMessage,
    validate: (value) => value.trim() !== '',
  });
  pkg.globalConfig.lastCommitMessage = message;
  await $$`git commit -m ${message}`;
  return pkg;
}

async function pushPull(pkg: PkgStack) {
  const { logger, $$ } = pkg.base;
  const { stdout: branch } = await $$`git branch --show-current`;
  await $$`git pull origin ${branch}`;
  logger.log(`${pc.blue('◆')} Pull done`);
  await $$`git push origin ${branch}`;
  logger.log(`${pc.blue('◆')} Push done`);
  return pkg;
}

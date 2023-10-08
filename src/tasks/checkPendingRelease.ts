import pc from 'picocolors';
import { PkgStack } from '../logic/PkgStack';
import { confirm } from '../prompts/confirm';
import { RETRY_NOW } from '../utils/pipeIfWithRetry';

export async function checkPendingRelease(pkg: PkgStack): Promise<PkgStack> {
  const { $$, logger } = pkg.base;
  const result = await $$`pnpm run --silent changelog`;
  if (result.stdout.trim().length > 0) {
    logger.log(`${pc.yellow('◆')} Pending release`);
    const releaseLogger = logger.child('  ');
    result.stdout.split('\n').forEach((line) => releaseLogger.log(line));
    const shouldRetry = await confirm({ logger: pkg.base.logger, message: `Confirm to try again, no to skip` });
    if (shouldRetry) {
      throw RETRY_NOW;
    }
    return pkg;
  }
  logger.log(`${pc.blue('◆')} No pending release`);
  return pkg;
}

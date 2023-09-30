import pc from 'picocolors';
import { PkgStack } from '../logic/PkgStack';
import { RETRY } from '../utils/pipeIfWithRetry';

export async function checkPendingRelease(pkg: PkgStack): Promise<PkgStack> {
  const { $$, logger } = pkg.base;
  const result = await $$`pnpm run --silent changelog`;
  if (result.stdout.trim().length > 0) {
    logger.log(`${pc.yellow('◆')} Pending release`);
    throw RETRY;
  }
  logger.log(`${pc.blue('◆')} No pending release`);
  return pkg;
}

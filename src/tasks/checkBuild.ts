import pc from 'picocolors';
import { PkgStack } from '../logic/PkgStack';
import { RETRY } from '../utils/pipeIfWithRetry';

export async function checkBuild(pkg: PkgStack): Promise<PkgStack> {
  const { logger, $$ } = pkg.base;
  try {
    await $$`pnpm run build`;
  } catch (error) {
    logger.log(`${pc.red('◆')} build failed`);
    throw RETRY;
  }
  logger.log(`${pc.blue('◆')} build passed`);
  return pkg;
}

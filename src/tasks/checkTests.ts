import pc from 'picocolors';
import { PkgStack } from '../logic/PkgStack';
import { RETRY } from '../utils/pipeIfWithRetry';

export async function checkTests(pkg: PkgStack): Promise<PkgStack> {
  const { logger, $$ } = pkg.base;
  try {
    await $$`pnpm test`;
  } catch (error) {
    logger.log(`${pc.red('◆')} Tests failed`);
    throw RETRY;
  }
  logger.log(`${pc.blue('◆')} Tests passed`);
  return pkg;
}

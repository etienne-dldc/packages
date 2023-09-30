import pc from 'picocolors';
import { PkgStack } from '../logic/PkgStack';
import { RETRY } from '../utils/pipeIfWithRetry';

export async function checkTypes(pkg: PkgStack): Promise<PkgStack> {
  const { logger, $$ } = pkg.base;
  try {
    await $$`pnpm run typecheck`;
  } catch (error) {
    logger.log(`${pc.red('◆')} Type checking failed`);
    throw RETRY;
  }
  logger.log(`${pc.blue('◆')} Type checking passed`);
  return pkg;
}

import { Separator } from '@inquirer/select';
import pc from 'picocolors';
import { PkgStack } from '../logic/PkgStack';
import { input } from '../prompts/input';
import { select } from '../prompts/select';
import { RETRY_NOW } from '../utils/pipeIfWithRetry';

export async function checkPendingRelease(pkg: PkgStack): Promise<PkgStack> {
  const { $$, logger } = pkg.base;
  const result = await $$`pnpm run --silent changelog`;
  if (result.stdout.trim().length > 0) {
    logger.log(`${pc.yellow('◆')} Pending release`);
    const releaseLogger = logger.child('  ');
    result.stdout.split('\n').forEach((line) => releaseLogger.log(line));

    const action = await select(logger, {
      message: `Pending release`,
      choices: [
        { value: 'patch', name: 'Patch' },
        { value: 'minor', name: 'Minor' },
        { value: 'major', name: 'Major' },
        new Separator(),
        { value: 'retry', name: 'Retry' },
        { value: 'skip', name: 'Skip' },
      ] as const,
    });

    if (action === 'retry') {
      throw RETRY_NOW;
    }
    if (action === 'skip') {
      logger.log(`${pc.blue('◆')} Skipped pending release`);
      return pkg;
    }
    // release
    const otp = await input(logger, { message: 'OTP' });
    const releaseResult = await $$`pnpm exec release-it ${action} --ci --npm.otp=${otp}`;
    logger.log(`${pc.green('◆')} Released`);
    releaseResult.stdout.split('\n').forEach((line) => releaseLogger.log(line));
    throw RETRY_NOW;
  }
  logger.log(`${pc.blue('◆')} No pending release`);
  return pkg;
}

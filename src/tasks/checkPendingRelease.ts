import { Separator } from '@inquirer/select';
import pc from 'picocolors';
import { PkgStack } from '../logic/PkgStack';
import { input } from '../prompts/input';
import { select } from '../prompts/select';
import { ILogger } from '../utils/logger';
import { RETRY_NOW } from '../utils/pipeIfWithRetry';

export async function checkPendingRelease(pkg: PkgStack): Promise<PkgStack> {
  const { $$, logger } = pkg.base;
  const result = await $$`pnpm run --silent changelog`;
  if (result.stdout.trim().length > 0) {
    logger.log(`${pc.yellow('◆')} Pending release`);
    const releaseLogger = logger.child('  ');
    result.stdout.split('\n').forEach((line) => releaseLogger.log(line));

    const action =
      pkg.globalConfig.runMode === 'skip'
        ? 'skip'
        : await select(logger, {
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
    await release(pkg, releaseLogger, action);
  }
  logger.log(`${pc.blue('◆')} No pending release`);
  return pkg;
}

async function release(pkg: PkgStack, releaseLogger: ILogger, bump: 'patch' | 'minor' | 'major') {
  const { $$, logger } = pkg.base;

  // release
  const otp = await input(logger, { message: 'OTP' });

  const releaseResult = await $$({ reject: false })`pnpm exec release-it ${bump} --ci --npm.otp=${otp}`;

  if (releaseResult.exitCode !== 0) {
    logger.log(`${pc.red('◆')} Failed to release`);
    releaseResult.stderr.split('\n').forEach((line) => releaseLogger.log(line));
    throw RETRY_NOW;
  }

  logger.log(`${pc.green('◆')} Released`);
  releaseResult.stdout.split('\n').forEach((line) => releaseLogger.log(line));
  throw RETRY_NOW;
}

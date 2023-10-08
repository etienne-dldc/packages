import pc from 'picocolors';
import { PkgStack } from '../logic/PkgStack';
import { confirm } from '../prompts/confirm';
import { RETRY_NOW } from '../utils/pipeIfWithRetry';

interface OudatedData {
  current: string;
  latest: string;
  wanted: string;
  isDeprecated: boolean;
  dependencyType: string;
}

export async function checkOudated(pkg: PkgStack): Promise<PkgStack> {
  const { logger, $$ } = pkg.base;
  const oudatedStr = (await $$({ reject: false })`pnpm outdated --format json`).stdout;
  const oudated = JSON.parse(oudatedStr) as Record<string, OudatedData>;
  const oudatedEntries = Object.entries(oudated);
  if (oudatedEntries.length > 0) {
    const outdatedDev = oudatedEntries.filter(([, { dependencyType }]) => dependencyType === 'devDependencies');
    const outdatedOther = oudatedEntries.filter(([, { dependencyType }]) => dependencyType !== 'devDependencies');
    const outdatedLogger = logger.child('    ');
    if (outdatedDev.length > 0) {
      logger.log(`${pc.red('◆')} Oudated Dev`);
      outdatedDev.forEach(([name, { current, latest }]) => {
        outdatedLogger.log(`${name}: ${pc.red(current)} -> ${pc.green(latest)}`);
      });
    }
    if (outdatedOther.length > 0) {
      logger.log(`${pc.red('◆')} Oudated`);
      outdatedOther.forEach(([name, { current, latest }]) => {
        outdatedLogger.log(`${name}: ${pc.red(current)} -> ${pc.green(latest)}`);
      });
    }
    const shouldRetry = await confirm({ logger: pkg.base.logger, message: `Confirm to try again, no to skip release` });
    if (shouldRetry) {
      throw RETRY_NOW;
    }
    return pkg;
  }

  logger.log(`${pc.blue('◆')} Deps are up to date`);
  return pkg;
}

import pc from 'picocolors';
import { PkgStack } from '../logic/PkgStack';
import { expand } from '../prompts/expand';
import { RETRY_NOW } from '../utils/pipeIfWithRetry';

interface OudatedData {
  current: string;
  latest: string;
  wanted: string;
  isDeprecated: boolean;
  dependencyType: string;
}

const oudatedPatterns = '!eslint';

export async function checkOudated(pkg: PkgStack): Promise<PkgStack> {
  const { logger, $$ } = pkg.base;
  const oudatedStr = (await $$({ reject: false })`pnpm outdated ${oudatedPatterns} --format json`).stdout;
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
    const action = await expand(logger, {
      message: `Oudated dependencies (${oudatedEntries.length})`,
      choices: [
        { key: 'r', name: 'Retry', value: 'retry' },
        { key: 's', name: 'Skip', value: 'skip' },
        { key: 'u', name: 'Update', value: 'update' },
      ],
    });
    switch (action) {
      case 'retry':
        throw RETRY_NOW;
      case 'skip':
        break;
      case 'update': {
        await updateDependencies(pkg);
        throw RETRY_NOW;
      }
    }
    return pkg;
  }

  logger.log(`${pc.blue('◆')} Deps are up to date`);
  return pkg;
}

async function updateDependencies(pkg: PkgStack) {
  const { logger, $$ } = pkg.base;
  const { stdout: branch } = await $$`git branch --show-current`;
  if (branch.trim() !== 'main') {
    logger.log(`${pc.red('◆')} Not on main branch (current branch is ${pc.green(branch.trim())}) `);
    throw RETRY_NOW;
  }
  await $$`pnpm update ${oudatedPatterns} --latest`;
  logger.log(`${pc.green('◆')} Dependencies updated`);
  await $$`git add .`;
  await $$`git commit -m ${`Update dependencies`}`;
  logger.log(`${pc.green('◆')} Created update commit`);
  await $$`git push`;
  logger.log(`${pc.green('◆')} Update commit pushed`);
  return pkg;
}

import pc from 'picocolors';
import { PkgStack, TGlobalConfig } from './logic/PkgStack';
import { IPackage, packages } from './packages';
import { confirm } from './prompts/confirm';
import { expand } from './prompts/expand';
import { select } from './prompts/select';
import { checkBuild } from './tasks/checkBuild';
import { checkCleanGig } from './tasks/checkCleanGig';
import { checkDependencies } from './tasks/checkDependencies';
import { checkLinting } from './tasks/checkLinting';
import { checkOudated } from './tasks/checkOudated';
import { checkPackageOrder } from './tasks/checkPackageOrder';
import { checkPendingRelease } from './tasks/checkPendingRelease';
import { checkTests } from './tasks/checkTests';
import { checkTypes } from './tasks/checkTypes';
import { ensureCloned } from './tasks/ensureCloned';
import { matchTemplate } from './tasks/matchTemplate';
import { readDldcConfig } from './tasks/readDldcConfig';
import { readPackageJson } from './tasks/readPackageJson';
import { asyncMap } from './utils/asyncMap';
import { ILogger, Logger } from './utils/logger';
import { pipeIfWithRetry } from './utils/pipeIfWithRetry';

main().catch(console.error);

async function main() {
  const logger = Logger.create();

  const globalConfig: TGlobalConfig = {};

  const packagesToCheck = await selectPackages(logger);

  logger.log(`${pc.blue('◆')} ${packagesToCheck.length} packages`);

  // All packages
  const pkgsBase = packagesToCheck
    .map((pkg) => PkgStack.create(logger, pkg, globalConfig))
    .filter((pkg) => !pkg.skipped);
  const pkgsCloned = await asyncMap(pkgsBase, async (pkg) => ensureCloned(pkg));
  pkgsCloned.forEach((pkg) => pkg.base.logger.reset());
  const pkgsReady = await pipeIfWithRetry(pkgsCloned, {
    condition: (pkg) => skippedCondition(pkg),
    steps: [readPackageJson, readDldcConfig, checkCleanGig],
    onRetry: onError,
  });
  await checkPackageOrder(pkgsReady);
  pkgsReady.forEach((pkg) => pkg.base.logger.reset());
  const pkgsDone = await pipeIfWithRetry(pkgsReady, {
    condition: (pkg) => skippedCondition(pkg, { silent: true }),
    steps: [
      readPackageJson,
      readDldcConfig,
      checkDependencies,
      matchTemplate,
      checkCleanGig,
      checkOudated,
      checkLinting,
      checkTypes,
      checkBuild,
      checkTests,
      checkPendingRelease,
      checkCleanGig,
    ],
    onRetry: onError,
  });
  logger.log(`${pc.blue('◆')} Done (${pkgsDone.length} packages)`);
}

function skippedCondition(pkg: PkgStack, { silent = false }: { silent?: boolean } = {}) {
  if (pkg.skipped) {
    if (!silent) {
      pkg.base.logger.log(`${pc.red('◆ Skipped')} ${pkg.base.coloredName}`);
    }
    return false;
  }
  return true;
}

async function onError(pkg: PkgStack) {
  await confirm(pkg.base.logger, { message: `Confirm to try again` });
}

async function selectPackages(logger: ILogger): Promise<readonly IPackage[]> {
  const mode = await expand(logger, {
    message: 'Select mode',
    expanded: true,
    choices: [
      { key: 'a', name: 'All', value: 'all' },
      { key: 's', name: 'Select', value: 'select' },
    ],
  });
  if (mode === 'all') {
    return packages;
  }
  const start = await select(logger, {
    message: 'Select start package',
    choices: packages.map((pkg) => ({ name: pkg.repository, value: pkg })),
  });
  return packages.slice(packages.indexOf(start));
}

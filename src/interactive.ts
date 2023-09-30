import pc from 'picocolors';
import { PkgStack } from './logic/PkgStack';
import { askForConfig } from './logic/askForConfig';
import { packages } from './packages';
import { confirm } from './prompts/confirm';
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
import { Logger } from './utils/logger';
import { pipeIfWithRetry } from './utils/pipeIfWithRetry';

main().catch(console.error);

async function main() {
  const logger = Logger.create();

  logger.log(`${pc.blue('◆')} ${packages.length} packages`);

  const config = await askForConfig(logger);

  // All packages
  const pkgsBase = packages.map((pkg) => PkgStack.create(logger, pkg)).filter((pkg) => !pkg.skipped);
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
  await confirm({ logger: pkg.base.logger, message: `Confirm to try again` });
}

import pc from 'picocolors';
import { IConfig, askForConfig } from './logic/askForConfig';
import { IPkgUtils, IPkgUtilsBase, pkgUtils, pkgUtilsBase } from './logic/pkgUtils';
import { resolveGraph } from './logic/resolveGraph';
import { packages } from './packages';
import { ensureCloned } from './tasks/ensureCloned';
import { waitForCleanGig } from './tasks/waitForCleanGig';
import { waitForMainBranch } from './tasks/waitForMainBranch';
import { waitForValidDldcConfig } from './tasks/waitForValidDldcConfig';
import { asyncMap } from './utils/asyncMap';
import { ILogger, Logger } from './utils/logger';

main().catch(console.error);

async function main() {
  const logger = Logger.create();

  // All packages
  const pkgsBase = packages.map((pkg) => pkgUtilsBase(pkg));
  // Make sure they are all cloned
  logger.log(`${pc.blue('◆')} Found ${pkgsBase.length} packages, making sure they are all cloned`);
  const pkgsBaseActive = (await asyncMap(pkgsBase, async (pkg) => await prepare(logger, pkg))).filter(
    (pkg) => !pkg.disabled,
  );

  // for (const pkg of pkgsBase) {
  //   const keep = await prepare(logger, pkg);
  //   if (keep) {
  //     pkgsBaseActive.push(pkg);
  //   }
  // }

  const pkgs = await Promise.all(pkgsBaseActive.map((pkg) => pkgUtils(pkg)));

  logger.log(`${pc.blue('◆')} Found ${pkgsBaseActive.length} packages to handle, resolving graph`);
  const pkgsOrdered = await resolveGraph(pkgs);
  logger.log(`${pc.blue('◆')} Graph resolved, starting tasks`);

  const config = await askForConfig(logger);

  for (const pkg of pkgsOrdered) {
    if (pkg.disabled) {
      continue;
    }
    const index = pkgs.indexOf(pkg) + 1;
    logger.log(`${pc.bgBlue(` ${index.toFixed().padStart(2, ' ')}/${pkgsOrdered.length} `)} ${pkg.pkgName}`);
    await runTasks(logger, config, pkg);
  }
}

/**
 *
 */
async function prepare(parentLogger: ILogger, pkg: IPkgUtilsBase): Promise<IPkgUtilsBase> {
  const logger = parentLogger.child(pkg.prefix);

  if (pkg.disabled) {
    parentLogger.log(`${pc.red('◆ Disabled')} ${pkg.pkgName}`);
    return pkg;
  }
  const clonedPkg = await ensureCloned(logger, pkg);
  if (clonedPkg.disabled) {
    parentLogger.log(`${pc.red('◆ Skipped')} ${pkg.pkgName}`);
    return clonedPkg;
  }
  return clonedPkg;
}

async function runTasks(parentLogger: ILogger, config: IConfig, pkg: IPkgUtils) {
  const logger = parentLogger.child(pkg.prefix);
  logger.log(`${pc.gray(pkg.folder)}`);

  await waitForMainBranch(logger, pkg);
  await waitForCleanGig(logger, pkg);
  const dldcConfig = await waitForValidDldcConfig(logger, pkg);
}

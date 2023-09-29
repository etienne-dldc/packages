import pc from 'picocolors';
import { PkgStack } from './logic/PkgStack';
import { askForConfig } from './logic/askForConfig';
import { resolveGraph } from './logic/resolveGraph';
import { packages } from './packages';
import { ensureCloned } from './tasks/ensureCloned';
import { matchTemplate } from './tasks/matchTemplate';
import { readDldcConfig } from './tasks/readDldcConfig';
import { readPackageJson } from './tasks/readPackageJson';
import { waitForCleanGig } from './tasks/waitForCleanGig';
import { Logger } from './utils/logger';
import { pipeArrayIf } from './utils/pipeArrayIf';

main().catch(console.error);

async function main() {
  const logger = Logger.create();

  logger.log(`${pc.blue('◆')} ${packages.length} packages`);
  // All packages
  const pkgs = await pipeArrayIf({
    initial: packages.map((pkg) => PkgStack.create(logger, pkg)),
    condition: (pkg) => {
      if (pkg.skipped) {
        pkg.base.logger.log(`${pc.red('◆ Skipped')}`);
        return false;
      }
      return true;
    },
    steps: [
      (pkg) => ensureCloned(pkg),
      (pkg) => readPackageJson(pkg),
      (pkg) => readDldcConfig(pkg),
      (pkg) => waitForCleanGig(pkg),
      (pkg) => {
        pkg.base.logger.reset();
        return pkg;
      },
    ],
  });

  logger.log(`${pc.blue('◆')} Found ${pkgs.length} packages to handle, resolving graph`);
  const pkgsOrdered = await resolveGraph(pkgs);
  logger.log(`${pc.blue('◆')} Graph resolved, starting tasks`);

  const config = await askForConfig(logger);

  const pkgsResult = await pipeArrayIf({
    initial: pkgsOrdered,
    condition: (pkg) => {
      if (pkg.skipped) {
        pkg.base.logger.log(`${pc.red('◆ Skipped')} ${pkg.base.coloredName}`);
        return false;
      }
      return true;
    },
    steps: [(pkg) => matchTemplate(pkg), (pkg) => waitForCleanGig(pkg, { silent: true })],
  });
}

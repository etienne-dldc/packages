import { $ } from 'execa';
import pc from 'picocolors';
import { PkgStack } from './logic/PkgStack';
import { packages } from './packages';
import { Logger } from './utils/logger';

main().catch(console.error);

async function main() {
  const logger = Logger.create();
  for (const pkgBase of packages) {
    const pkg = PkgStack.create(logger, pkgBase);
    logger.log(pkg.base.coloredName);
    await resetPackage(pkg);
  }
}

async function resetPackage(pkg: PkgStack) {
  const { prefix, logger, folder, coloredName } = pkg.base;
  logger.log(coloredName);
  const subLogger = logger.child(prefix);
  if (pkg.skipped) {
    logger.log(`${pc.red('◆')} Disabled`);
    return;
  }

  subLogger.log(`${pc.gray(folder)}`);
  const $$ = $({ cwd: folder, verbose: false });
  const isClean = async () => (await $$`git status --porcelain`).stdout.trim() === '';
  if (await isClean()) {
    subLogger.log(`${pc.green('●')} No changes`);
    return;
  }
  subLogger.log(`Resetting`);
  await $$`git reset --hard`;
  subLogger.log(`${pc.blue('●')} Reset`);
}

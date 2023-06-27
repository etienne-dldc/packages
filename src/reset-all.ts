import { $ } from 'execa';
import pc from 'picocolors';
import { IPackage, packages } from './packages';
import { Logger } from './utils/logger';
import { pkgUtils } from './utils/pkgUtils';

main().catch(console.error);

async function main() {
  for (const pkg of packages) {
    await resetPackage(pkg);
  }
}

async function resetPackage(pkg: IPackage) {
  const { prefix, pkgName, folder } = pkgUtils(pkg);
  const logger = Logger.create();
  logger.log(pkgName);
  const subLogger = logger.withPrefix(prefix);
  subLogger.log(`${pc.gray(folder)}`);
  const $$ = $({ cwd: folder, verbose: false });
  const isClean = async () => (await $$`git status --porcelain`).stdout.trim() === '';
  if (await isClean()) {
    subLogger.log(`${pc.green('●')} No changes`);
    return;
  }
  subLogger.log(`Resetting ${pkgName}`);
  await $$`git reset --hard`;
  subLogger.log(`${pc.blue('●')} Reset`);
}

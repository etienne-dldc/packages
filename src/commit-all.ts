import pc from 'picocolors';
import { PkgStack } from './logic/PkgStack';
import { packages } from './packages';
import { input } from './prompts/input';
import { Logger } from './utils/logger';

main().catch(console.error);

async function main() {
  const logger = Logger.create();
  const message = await input({ logger, message: 'Commit message' });
  for (const pkgBase of packages) {
    const pkg = PkgStack.create(logger, pkgBase);
    logger.log(pkg.base.coloredName);
    await commitPackage(pkg, message);
  }
}

async function commitPackage(pkg: PkgStack, message: string) {
  const { $$, logger, folder } = pkg.base;
  logger.log(`${pc.gray(folder)}`);
  if (pkg.skipped) {
    logger.log(`${pc.red('◆')} Disabled`);
    return;
  }

  const isClean = async () => (await $$`git status --porcelain`).stdout.trim() === '';
  if (await isClean()) {
    logger.log(`${pc.green('●')} No changes`);
    return;
  }
  logger.log(`Commit`);
  await $$`git add --all`;
  await $$`git commit -m ${message}`;
  logger.log(`Push`);
  await $$`git push`;
  logger.log(`${pc.green('●')} Done`);
}

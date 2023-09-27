import { isCancel } from '@clack/core';
import { input } from '@inquirer/prompts';
import { $ } from 'execa';
import pc from 'picocolors';
import { pkgUtilsBase } from './logic/pkgUtils';
import { IPackage, packages } from './packages';
import { Logger } from './utils/logger';

main().catch(console.error);

async function main() {
  const message = await input({ message: 'Commit message' });
  if (isCancel(message)) {
    return;
  }
  for (const pkg of packages) {
    await commitPackage(pkg, message);
  }
}

async function commitPackage(pkg: IPackage, message: string) {
  const { prefix, pkgName, folder } = pkgUtilsBase(pkg);
  const logger = Logger.create();
  logger.log(pkgName);
  const subLogger = logger.child(prefix);
  subLogger.log(`${pc.gray(folder)}`);
  if (pkg.disabled) {
    subLogger.log(`${pc.red('◆')} Disabled`);
    return;
  }

  const $$ = $({ cwd: folder, verbose: false });
  const isClean = async () => (await $$`git status --porcelain`).stdout.trim() === '';
  if (await isClean()) {
    subLogger.log(`${pc.green('●')} No changes`);
    return;
  }
  subLogger.log(`Commit`);
  await $$`git add --all`;
  await $$`git commit -m ${message}`;
  subLogger.log(`Push`);
  await $$`git push`;
  subLogger.log(`${pc.green('●')} Done`);
}

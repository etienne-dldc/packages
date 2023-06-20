import { isCancel } from '@clack/core';
import { input } from '@inquirer/prompts';
import pc from 'picocolors';
import { $ } from 'zx';
import { IPackage, packages } from './packages';
import { Logger } from './utils/logger';
import { pkgUtils } from './utils/pkgUtils';

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
  const { prefix, pkgName, folder } = pkgUtils(pkg);
  const logger = Logger.create();
  logger.log(pkgName);
  const subLogger = logger.withPrefix(prefix);
  subLogger.log(`${pc.gray(folder)}`);
  $.verbose = false;
  $.cwd = folder;
  const isClean = async () => (await $`git status --porcelain`).stdout.trim() === '';
  if (await isClean()) {
    subLogger.log(`${pc.green('●')} No changes`);
    return;
  }
  subLogger.log(`Committing ${pkgName}`);
  await $`git add --all`;
  await $`git commit -m ${message}`;
  await $`git push`;
  subLogger.log(`${pc.blue('●')} Committed and pushed`);
}

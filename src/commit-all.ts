import { isCancel } from '@clack/core';
import pc from 'picocolors';
import { $ } from 'zx';
import { IPackage, packages } from './packages';
import { text } from './prompts/text';
import { pkgUtils } from './utils/pkgUtils';

main().catch(console.error);

async function main() {
  const message = await text({ message: 'Commit message' });
  if (isCancel(message)) {
    return;
  }
  for (const pkg of packages) {
    await commitPackage(pkg, message);
  }
}

async function commitPackage(pkg: IPackage, message: string) {
  const { log, pkgName, folder } = pkgUtils(pkg);
  $.verbose = false;
  $.cwd = folder;
  const isClean = async () => (await $`git status --porcelain`).stdout.trim() === '';
  if (await isClean()) {
    log(`${pc.green('●')} No changes`);
    return;
  }
  log(`Committing ${pkgName}`);
  await $`git add --all`;
  await $`git commit -m ${message}`;
  await $`git push`;
  log(`${pc.blue('●')} Committed and pushed`);
}

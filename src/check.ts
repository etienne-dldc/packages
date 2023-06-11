import { existsSync } from 'fs';
import { readJson } from 'fs-extra';
import { readdir, rm } from 'fs/promises';
import { relative, resolve } from 'path';
import pc from 'picocolors';
import sortPackageJson from 'sort-package-json';
import { $ } from 'zx';
import { IPackage, packages } from './packages';
import { confirm } from './prompts/confirm';
import { copyAll } from './utils/copyAll';
import { createPackageJson } from './utils/createPackageJson';
import { saveFile } from './utils/saveFile';

main().catch(console.error);

async function main() {
  for (const pkg of packages) {
    await checkPackage(pkg);
  }
}

const KEEP_FILES = ['.git', 'src', 'tests', 'README.md', 'pnpm-lock.yaml', 'design'];

async function checkPackage(pkg: IPackage) {
  const pkgName = `${pc.blue(pkg.org)}/${pc.green(pkg.name)}`;
  console.log(pkgName);
  const baseDir = resolve(`${process.env.HOME}/Workspace`);
  const folder = resolve(baseDir, `github.com/${pkg.org}/${pkg.name}`);
  const prefix = ` ${pc.gray('│')} `;
  const log = (message: string) => console.log(`${prefix} ${message}`);
  $.verbose = false;
  const relativeFolder = relative(baseDir, folder);
  log(`${pc.gray(folder)}`);
  if (!existsSync(folder)) {
    const shouldClone = await confirm({
      message: `Folder ${pc.blue(relativeFolder)} does not exist. Clone it?`,
    });
    if (!shouldClone) {
      log(`Skipping ${pkgName}`);
      return;
    }
    const gitLink = `git@github.com:${pkg.org}/${pkg.name}.git`;
    log(`Cloning in ${pkgName}`);
    await $`git clone -- ${gitLink} ${folder}`;
    log(`Cloned`);
  }
  $.cwd = folder;
  // is main branch
  const { stdout: branch } = await $`git branch --show-current`;
  log(`On branch ${pc.green(branch.trim())}`);
  if (branch.trim() !== 'main') {
    log(`${pc.red('◆')} Not on main branch`);
    return;
  }
  // is clean
  const isClean = async () => (await $`git status --porcelain`).stdout.trim() === '';
  if (!(await isClean())) {
    log(`${pc.red('◆')} Not clean`);
    log(`Opennning ${pkgName} in VSCode`);
    await $`code ${folder}`;
    return;
  }
  const allFiles = await readdir(folder);
  const filesToRemove = allFiles.filter((file) => !KEEP_FILES.includes(file));
  const prevPackageJson = await readJson(resolve(folder, 'package.json'));
  // remove files
  for (const file of filesToRemove) {
    await rm(resolve(folder, file), { recursive: true, force: true });
  }
  // copy all files from template
  const templateFolder = resolve('templates/base');
  await copyAll(templateFolder, folder);
  // create package.json
  const newPackageJson = createPackageJson(prevPackageJson, pkg);
  await saveFile(folder, 'package.json', sortPackageJson(JSON.stringify(newPackageJson, null, 2)));
  log(`Installing deps`);
  await $`pnpm i`;
  log(`Running lint:fix`);
  await $`pnpm run lint:fix`;
  if (pkg.deno) {
    log(`Building deno`);
    await $`pnpm run build:deno`;
  }
  try {
    log(`Running tests`);
    await $`pnpm test`;
  } catch (error) {
    log(`${pc.red('◆')} Tests failed`);
  }
  if (!(await isClean())) {
    log(`${pc.red('◆')} Not clean`);
    log(`Opennning ${pkgName} in VSCode`);
    await $`code ${folder}`;
    return;
  }
  log(`${pc.green('●')} All good`);

  // const { didUpdateNodeVersion } = await checkNodeVersion(folder, log);
  // const { didInstallPnpm } = await checkPnpm(folder, log);
  // const { didRemoveJest } = await checkNoJest(folder, log);
  // const { didAddVitest } = await checkVitest(folder, log);

  // if (didUpdateNodeVersion || didInstallPnpm || didRemoveJest || didAddVitest) {
  //   log(`Opennning ${pkgName} in VSCode`);
  //   await $`code ${folder}`;
  // }
}

import { existsSync } from 'fs';
import { readJson } from 'fs-extra';
import { readdir, rm } from 'fs/promises';
import { resolve } from 'path';
import pc from 'picocolors';
import sortPackageJson from 'sort-package-json';
import { $ } from 'zx';
import { IPackage } from './packages';
import { confirm } from './prompts/confirm';
import { copyAll } from './utils/copyAll';
import { createPackageJson } from './utils/createPackageJson';
import { createTsconfig } from './utils/createTsconfig';
import { pkgUtils } from './utils/pkgUtils';
import { saveFile } from './utils/saveFile';
import { selectPackages } from './utils/selectPackages';

main().catch(console.error);

async function main() {
  const selectedPackages = await selectPackages();

  for (const pkg of selectedPackages) {
    await checkPackage(pkg);
  }
}

async function checkPackage(pkg: IPackage) {
  const forceInstall = false;
  const KEEP_FILES = [
    '.git',
    'src',
    'tests',
    'README.md',
    'pnpm-lock.yaml',
    'design',
    forceInstall ? null : 'node_modules',
  ].filter(Boolean);

  const { log, folder, relativeFolder, pkgName } = pkgUtils(pkg);
  $.verbose = false;
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
  // copy files from custom/package
  const customPackageFolder = resolve('templates/custom', pkg.name);
  if (existsSync(customPackageFolder)) {
    await copyAll(customPackageFolder, folder);
  }
  // create package.json
  const newPackageJson = createPackageJson(prevPackageJson, pkg);
  await saveFile(folder, 'package.json', sortPackageJson(JSON.stringify(newPackageJson, null, 2)));
  // create tsconfig.json
  const tsconfigFile = createTsconfig(pkg);
  await saveFile(folder, 'tsconfig.json', tsconfigFile);
  log(`Installing deps`);
  await $`pnpm i`;
  log(`Running lint:fix`);
  await $`pnpm run lint:fix`;

  let buildSuccess = true;
  try {
    log(`Building`);
    await $`pnpm run build`;
  } catch (error) {
    buildSuccess = false;
    log(`${pc.red('◆')} Build failed`);
  }

  let testSuccess = true;
  try {
    log(`Running tests`);
    await $`pnpm test`;
  } catch (error) {
    testSuccess = false;
    log(`${pc.red('◆')} Tests failed`);
  }

  if (!(await isClean()) || !testSuccess || !buildSuccess) {
    log(`${pc.red('◆')} Not clean`);
    log(`Opennning ${pkgName} in VSCode`);
    await $`code ${folder}`;
    return;
  }
  log(`${pc.green('●')} All good`);
}

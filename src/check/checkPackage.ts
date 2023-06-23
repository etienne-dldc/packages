import { confirm } from '@inquirer/prompts';
import { existsSync } from 'fs';
import { readJson } from 'fs-extra';
import { readdir, rm } from 'fs/promises';
import { resolve } from 'path';
import pc from 'picocolors';
import sortPackageJson from 'sort-package-json';
import { $ } from 'zx';
import { IPackage } from '../packages';
import { copyAll } from '../utils/copyAll';
import { loadConfig } from '../utils/loadConfig';
import { ILogger } from '../utils/logger';
import { pkgUtils } from '../utils/pkgUtils';
import { saveFile } from '../utils/saveFile';
import { createEslintConfig } from './createEslintConfig';
import { createPackageJson } from './createPackageJson';
import { createTsconfig } from './createTsconfig';

export async function checkPackage(parentLogger: ILogger, pkg: IPackage) {
  const { prefix, folder, relativeFolder, pkgName } = pkgUtils(pkg);
  if (pkg.deprecated) {
    parentLogger.log(`Skipping ${pkgName} (deprecated)`);
    return;
  }

  const forceInstall = false;
  const checkCleanBefore = false;

  parentLogger.log(pkgName);
  const logger = parentLogger.withPrefix(prefix);
  logger.log(`${pc.gray(folder)}`);

  $.verbose = false;
  if (!existsSync(folder)) {
    const shouldClone = await confirm({
      message: `Folder ${pc.blue(relativeFolder)} does not exist. Clone it?`,
    });
    if (!shouldClone) {
      logger.log(`Skipping ${pkgName}`);
      return;
    }
    const gitLink = `git@github.com:${pkg.org}/${pkg.name}.git`;
    logger.log(`Cloning in ${pkgName}`);
    await $`git clone -- ${gitLink} ${folder}`;
    logger.log(`Cloned`);
  }

  const config = await loadConfig(logger, folder);

  const KEEP_FILES = [
    '.git',
    'src',
    'tests',
    'README.md',
    'pnpm-lock.yaml',
    'design',
    'config.json',
    forceInstall ? null : 'node_modules',
    config.viteExample ? 'example' : null,
  ].filter(Boolean);

  $.cwd = folder;
  // is main branch
  const { stdout: branch } = await $`git branch --show-current`;
  logger.log(`On branch ${pc.green(branch.trim())}`);
  if (branch.trim() !== 'main') {
    logger.log(`${pc.red('◆')} Not on main branch`);
    return;
  }
  const isClean = async () => (await $`git status --porcelain`).stdout.trim() === '';
  if (checkCleanBefore && !(await isClean())) {
    logger.log(`${pc.red('◆')} Not clean`);
    logger.log(`Opennning ${pkgName} in VSCode`);
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
  const newPackageJson = createPackageJson(prevPackageJson, pkg, config);
  await saveFile(folder, 'package.json', sortPackageJson(JSON.stringify(newPackageJson, null, 2)));
  // create tsconfig.json
  const tsconfigFile = createTsconfig(config);
  await saveFile(folder, 'tsconfig.json', JSON.stringify(tsconfigFile, null, 2));
  // Create .eslintrc.json
  const eslintConfig = createEslintConfig(config);
  await saveFile(folder, '.eslintrc.json', JSON.stringify(eslintConfig, null, 2));
  logger.log(`Installing deps`);
  await $`pnpm i`;
  logger.log(`Running lint:fix`);
  await $`pnpm run lint:fix`;

  let buildSuccess = true;
  try {
    logger.log(`Building`);
    await $`pnpm run build`;
  } catch (error) {
    buildSuccess = false;
    logger.log(`${pc.red('◆')} Build failed`);
  }

  let testSuccess = true;
  try {
    logger.log(`Running tests`);
    await $`pnpm test`;
  } catch (error) {
    testSuccess = false;
    logger.log(`${pc.red('◆')} Tests failed`);
  }

  if (!(await isClean()) || !testSuccess || !buildSuccess) {
    logger.log(`${pc.red('◆')} Not clean`);
    logger.log(`Opennning ${pkgName} in VSCode`);
    await $`code ${folder}`;
    return;
  }
  logger.log(`${pc.green('●')} All good`);
}

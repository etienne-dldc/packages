import { confirm } from '@inquirer/prompts';
import { $ } from 'execa';
import { existsSync } from 'fs';
import { readJson } from 'fs-extra';
import { readFile, readdir, rm, writeFile } from 'fs/promises';
import { resolve } from 'path';
import pc from 'picocolors';
import sortPackageJson from 'sort-package-json';
import { IPackage } from '../packages';
import { copyAll } from '../utils/copyAll';
import { loadConfig } from '../utils/loadConfig';
import { ILogger } from '../utils/logger';
import { pkgUtils } from '../utils/pkgUtils';
import { saveFile } from '../utils/saveFile';
import { createEslintConfig } from './createEslintConfig';
import { createPackageJson } from './createPackageJson';
import { createTsconfig } from './createTsconfig';
import { createVitestConfig } from './createVitestConfig';

export type CheckResult = { success: boolean; pkg: IPackage };

interface OudatedData {
  current: string;
  latest: string;
  wanted: string;
  isDeprecated: boolean;
  dependencyType: string;
}

export async function checkPackage(
  parentLogger: ILogger,
  pkg: IPackage,
  { deffered, fast }: { deffered: boolean; fast: boolean },
): Promise<CheckResult> {
  const { prefix, folder, relativeFolder, pkgName } = pkgUtils(pkg);

  const forceInstall = true;
  const rebuildLockfile = true;
  const checkOudated = true;
  const checkCleanBefore = true;
  const checkCleanAfter = true;
  const checkPendingRelease = true;

  parentLogger.log(pkgName);
  const logger = parentLogger.withPrefix(prefix);
  logger.log(`${pc.gray(folder)}`);

  if (pkg.disabled) {
    logger.log(`${pc.red('◆')} Disabled`);
    return { success: true, pkg };
  }

  if (!existsSync(folder)) {
    const shouldClone =
      deffered &&
      (await confirm({
        message: `Folder ${pc.blue(relativeFolder)} does not exist. Clone it?`,
      }));
    if (!shouldClone) {
      logger.log(`Skipping ${pkgName}`);
      return { success: false, pkg };
    }
    const gitLink = `git@github.com:${pkg.org}/${pkg.repository}.git`;
    logger.log(`Cloning in ${pkgName}`);
    await $({ verbose: false })`git clone -- ${gitLink} ${folder}`;
    logger.log(`Cloned`);
  }

  const $$ = $({ cwd: folder, verbose: false });

  // is main branch
  const { stdout: branch } = await $$`git branch --show-current`;
  logger.log(`On branch ${pc.green(branch.trim())}`);
  if (branch.trim() !== 'main') {
    logger.log(`${pc.red('◆')} Not on main branch`);
    return { success: false, pkg };
  }

  // make sure there are no uncommited changes
  const checkIsClean = async () => (await $$`git status --porcelain`).stdout.trim() === '';
  const isClean = await checkIsClean();
  if (checkCleanBefore && !isClean) {
    logger.log(`${pc.red('◆')} Not clean`);
    return { success: false, pkg };
  }

  // pull latest
  if (isClean) {
    logger.log(`Pulling latest`);
    await $$`git pull`;
  }

  const config = await loadConfig(logger, folder);
  if (!config) {
    return { success: false, pkg };
  }

  const KEEP_FILES = [
    '.git',
    'src',
    'tests',
    'README.md',
    rebuildLockfile ? null : 'pnpm-lock.yaml',
    'design',
    'config.json',
    forceInstall ? null : 'node_modules',
    config.viteExample ? 'example' : null,
    config.scripts ? 'scripts' : null,
    ...config.keep,
  ].filter(Boolean);

  // remove all files except for the ones we want to keep
  if (!fast) {
    const allFiles = await readdir(folder);
    const filesToRemove = allFiles.filter((file) => !KEEP_FILES.includes(file));
    const prevPackageJson = await readJson(resolve(folder, 'package.json'));
    // remove files
    for (const file of filesToRemove) {
      await rm(resolve(folder, file), { recursive: true, force: true });
    }
    // copy all files from template
    const templateFolder = resolve('template');
    await copyAll(templateFolder, folder);
    // create package.json
    const newPackageJson = createPackageJson(prevPackageJson, pkg, config);
    await saveFile(folder, 'package.json', sortPackageJson(JSON.stringify(newPackageJson, null, 2)));
    // create tsconfig.json
    const tsconfigFile = createTsconfig(config);
    await saveFile(folder, 'tsconfig.json', tsconfigFile);
    // Create .eslintrc.json
    const eslintConfig = createEslintConfig(config);
    await saveFile(folder, '.eslintrc.json', JSON.stringify(eslintConfig, null, 2));
    // Create vitest.config.ts
    const vitestConfig = createVitestConfig(config);
    await saveFile(folder, 'vitest.config.ts', vitestConfig);
    // add custom gitignore entries
    if (config.gitignore.length > 0) {
      const gitignorePath = resolve(folder, '.gitignore');
      const gitignoreStr = await readFile(gitignorePath, 'utf-8');
      const gitignoreLines = gitignoreStr.split('\n');
      const newGitignoreLines = [...gitignoreLines, ...config.gitignore];
      await writeFile(gitignorePath, newGitignoreLines.join('\n'));
    }
  }

  // Install deps
  logger.log(`Installing deps`);
  await $$`pnpm i`;

  let oudatedSuccess = true;
  if (checkOudated) {
    logger.log(`Checking oudated`);
    const oudatedStr = (await $$({ reject: false })`pnpm outdated --format json`).stdout;
    const oudated = JSON.parse(oudatedStr) as Record<string, OudatedData>;
    const oudatedEntries = Object.entries(oudated);
    if (oudatedEntries.length > 0) {
      oudatedSuccess = false;
      const outdatedDev = oudatedEntries.filter(([, { dependencyType }]) => dependencyType === 'devDependencies');
      const outdatedOther = oudatedEntries.filter(([, { dependencyType }]) => dependencyType !== 'devDependencies');
      const outdatedLogger = logger.withPrefix('    ');
      if (outdatedDev.length > 0) {
        logger.log(`${pc.red('◆')} Oudated Dev`);
        outdatedDev.forEach(([name, { current, latest }]) => {
          outdatedLogger.log(`${name}: ${pc.red(current)} -> ${pc.green(latest)}`);
        });
      }
      if (outdatedOther.length > 0) {
        logger.log(`${pc.red('◆')} Oudated`);
        outdatedOther.forEach(([name, { current, latest }]) => {
          outdatedLogger.log(`${name}: ${pc.red(current)} -> ${pc.green(latest)}`);
        });
      }
    }
  }

  let lintFixSuccess = true;
  try {
    logger.log(`Running lint:fix`);
    await $$`pnpm run lint:fix`;
  } catch (error) {
    lintFixSuccess = false;
    logger.log(`${pc.red('◆')} lint:fix failed`);
  }

  let typecheckSuccess = true;
  try {
    logger.log(`Type checking`);
    await $$`pnpm run typecheck`;
  } catch (error) {
    typecheckSuccess = false;
    logger.log(`${pc.red('◆')} Type checking failed`);
  }

  let buildSuccess = true;
  try {
    logger.log(`Building`);
    await $$`pnpm run build`;
  } catch (error) {
    buildSuccess = false;
    logger.log(`${pc.red('◆')} Build failed`);
  }

  let testSuccess = true;
  try {
    logger.log(`Running tests`);
    await $$`pnpm test`;
  } catch (error) {
    testSuccess = false;
    logger.log(`${pc.red('◆')} Tests failed`);
  }

  let noPendingRelease = true;
  if (checkPendingRelease) {
    const result = await $$`pnpm run --silent changelog`;
    if (result.stdout.trim().length > 0) {
      noPendingRelease = false;
      logger.log(`${pc.yellow('◆')} Pending release`);
    }
  }

  let isCleanAfter = true;
  if (checkCleanAfter) {
    if (!(await checkIsClean())) {
      isCleanAfter = false;
      logger.log(`${pc.red('◆')} Not clean`);
    }
  }

  if (
    !isCleanAfter ||
    !testSuccess ||
    !buildSuccess ||
    !typecheckSuccess ||
    !lintFixSuccess ||
    !oudatedSuccess ||
    !noPendingRelease
  ) {
    return { success: false, pkg };
  }
  logger.log(`${pc.green('●')} All good`);
  return { success: true, pkg };
}

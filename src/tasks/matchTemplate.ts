import { readdir } from 'fs-extra';
import { readFile, rm, writeFile } from 'fs/promises';
import { resolve } from 'path';
import pc from 'picocolors';
import sortPackageJson from 'sort-package-json';
import { createPackageJson } from '../generate/createPackageJson';
import { createTsconfig } from '../generate/createTsconfig';
import { createVitestConfig } from '../generate/createVitestConfig';
import { PkgStack } from '../logic/PkgStack';
import { copyAll } from '../utils/copyAll';
import { saveFile } from '../utils/saveFile';
import { DldcConfigKey } from './readDldcConfig';

/**
 * Make sure the repo match the template
 */
export async function matchTemplate(pkg: PkgStack): Promise<PkgStack> {
  const dldcConfig = pkg.getOrFail(DldcConfigKey.Consumer);
  const { logger, $$, folder } = pkg.base;

  const rebuildLockfile = false;
  const forceInstall = false;

  const KEEP_FILES = [
    '.git',
    'src',
    'tests',
    'README.md',
    rebuildLockfile ? null : 'pnpm-lock.yaml',
    'design',
    forceInstall ? null : 'node_modules',
    dldcConfig.viteExample ? 'example' : null,
    dldcConfig.scripts ? 'scripts' : null,
    ...dldcConfig.keep,
  ].filter(Boolean);

  const allFiles = await readdir(folder);
  const filesToRemove = allFiles.filter((file) => !KEEP_FILES.includes(file));
  // remove files
  for (const file of filesToRemove) {
    await rm(resolve(folder, file), { recursive: true, force: true });
  }
  // copy all files from template
  const templateFolder = resolve('template');
  await copyAll(templateFolder, folder);
  // create package.json
  const newPackageJson = createPackageJson(pkg);
  await saveFile(folder, 'package.json', sortPackageJson(JSON.stringify(newPackageJson, null, 2)));
  // create tsconfig.json
  const tsconfigFile = createTsconfig(dldcConfig);
  await saveFile(folder, 'tsconfig.json', tsconfigFile);
  // Create vitest.config.ts
  const vitestConfig = createVitestConfig(dldcConfig);
  await saveFile(folder, 'vitest.config.ts', vitestConfig);
  // add custom gitignore entries
  if (dldcConfig.gitignore.length > 0) {
    const gitignorePath = resolve(folder, '.gitignore');
    const gitignoreStr = await readFile(gitignorePath, 'utf-8');
    const gitignoreLines = gitignoreStr.split('\n');
    const newGitignoreLines = [...gitignoreLines, ...dldcConfig.gitignore];
    await writeFile(gitignorePath, newGitignoreLines.join('\n'));
  }

  // Install deps
  await $$`pnpm i`;

  logger.log(`${pc.blue('◆')} Template initialized`);

  return pkg;
}

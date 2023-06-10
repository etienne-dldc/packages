import { existsSync } from 'fs';
import { readFile, rm, writeFile } from 'fs/promises';
import { relative, resolve } from 'path';
import pc from 'picocolors';
import sortPackageJson from 'sort-package-json';
import { $ } from 'zx';
import { Package, packages } from './packages';
import { confirm } from './prompts/confirm';
import { saveFile } from './utils/saveFile';

main().catch(console.error);

const NODE_VERSION = 'v18.16.0\n';

async function main() {
  for (const pkg of packages) {
    await checkPackage(pkg);
  }
}

async function checkPackage(pkg: Package) {
  const pkgName = `${pc.blue(pkg.org)}/${pc.green(pkg.name)}`;
  console.log(pkgName);
  const baseDir = resolve(`${process.env.HOME}/Workspace`);
  const folder = resolve(baseDir, `github.com/${pkg.org}/${pkg.name}`);
  const prefix = ` ${pc.gray('│')} `;
  const log = (message: string) => console.log(`${prefix} ${message}`);
  $.cwd = folder;
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
  }
  const { didUpdateNodeVersion } = await checkNodeVersion(folder, log);
  const { didInstallPnpm } = await checkPnpm(folder, log);
  const { didRemoveJest } = await checkNoJest(folder, log);
  const { didAddVitest } = await checkVitest(folder, log);

  if (didUpdateNodeVersion || didInstallPnpm || didRemoveJest || didAddVitest) {
    log(`Opennning ${pkgName} in VSCode`);
    await $`code ${folder}`;
  }
}

async function checkNodeVersion(
  folder: string,
  log: (message: string) => void
): Promise<{ didUpdateNodeVersion: boolean }> {
  let didUpdateNodeVersion = false;
  const nvmRcPath = resolve(folder, '.nvmrc');
  const nodeVersionPath = resolve(folder, '.node-version');
  if (existsSync(nvmRcPath)) {
    log(`Renaming ${pc.gray('.nvmrc')} to ${pc.gray('.node-version')}`);
    await $`mv ${nvmRcPath} ${nodeVersionPath}`;
    didUpdateNodeVersion = true;
  }
  const nodeVersionValue = await readFile(nodeVersionPath, 'utf-8');
  if (nodeVersionValue !== NODE_VERSION) {
    log('Updating .node-version to latest version');
    await writeFile(nodeVersionPath, NODE_VERSION);
    didUpdateNodeVersion = true;
  }
  updatePackageJson(folder, (packageJson) => {
    if (!packageJson.engines) {
      return false;
    }
    delete packageJson.engines;
    didUpdateNodeVersion = true;
    return packageJson;
  });
  return { didUpdateNodeVersion };
}

async function checkPnpm(folder: string, log: (message: string) => void): Promise<{ didInstallPnpm: boolean }> {
  log('Checking if pnpm is installed');
  const nodeModulesPath = resolve(folder, 'node_modules');
  const yarnLockPath = resolve(folder, 'yarn.lock');
  const packageLockPath = resolve(folder, 'package-lock.json');
  let didInstallPnpm = false;
  if (existsSync(yarnLockPath) || existsSync(packageLockPath)) {
    if (existsSync(yarnLockPath)) {
      log(`Found ${pc.gray('yarn.lock')} exists. Removing it.`);
      await rm(yarnLockPath);
    }
    if (existsSync(packageLockPath)) {
      log(`Found ${pc.gray('yarn.lock')} exists. Removing it.`);
      await rm(packageLockPath);
    }
    if (existsSync(nodeModulesPath)) {
      log('Removing node_modules');
      await rm(nodeModulesPath, { recursive: true });
    }
    log('Installing with pnpm');
    await $`pnpm install`;
  }
  await updatePackageJson(folder, (packageJson) => {
    if (packageJson.packageManager !== 'pnpm@8.6.1') {
      packageJson.packageManager = 'pnpm@8.6.1';
      didInstallPnpm = true;
      return packageJson;
    }
    return false;
  });
  return { didInstallPnpm };
}

async function checkNoJest(folder: string, log: (message: string) => void): Promise<{ didRemoveJest: boolean }> {
  const jesConfigPath = resolve(folder, 'jest.config.js');
  if (!existsSync(jesConfigPath)) {
    log('Jest not found');
    return { didRemoveJest: false };
  }
  log(`Found ${pc.gray('jest.config.js')} exists. Removing it.`);
  await rm(jesConfigPath);
  log('Removing jest packages from package.json');
  await $`pnpm remove jest @types/jest ts-jest`;
  return { didRemoveJest: true };
}

async function checkVitest(folder: string, log: (message: string) => void): Promise<{ didAddVitest: boolean }> {
  const vitestConfigPath = resolve(folder, 'vitest.config.ts');
  if (existsSync(vitestConfigPath)) {
    log('Vitest already installed');
    return { didAddVitest: false };
  }
  log('Adding vitest');
  await $`pnpm add -D vitest @vitest/coverage-v8`;
  log('Adding vitest config');
  const vitestConfig = `import { defineConfig } from 'vitest/config';\n  export default defineConfig({\n    test: {},\n  });\n  `;
  await saveFile(folder, 'vitest.config.ts', vitestConfig);
  log('Adding vitest script');
  await updatePackageJson(folder, (packageJson) => {
    packageJson.scripts = {
      ...packageJson.scripts,
      test: 'pnpm run lint && vitest run --coverage',
      'test:run': 'vitest run',
      'test:watch': 'vitest --watch',
    };
    return packageJson;
  });

  return { didAddVitest: true };
}

async function updatePackageJson(folder: string, update: (pkg: any) => any | false) {
  const packageJsonPath = resolve(folder, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
  const result = update(packageJson);
  if (result === false) {
    return;
  }
  await saveFile(folder, 'package.json', sortPackageJson(JSON.stringify(result, null, 2)));
}

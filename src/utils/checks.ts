import { existsSync } from 'fs';
import { readFile, rm, writeFile } from 'fs/promises';
import { resolve } from 'path';
import pc from 'picocolors';
import { $ } from 'zx';
import { saveFile } from './saveFile';
import { updatePackageJson } from './updatePackageJson';

const NODE_VERSION = 'v18.16.0\n';

export async function checkNodeVersion(
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

export async function checkPnpm(folder: string, log: (message: string) => void): Promise<{ didInstallPnpm: boolean }> {
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

export async function checkNoJest(folder: string, log: (message: string) => void): Promise<{ didRemoveJest: boolean }> {
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

export async function checkVitest(folder: string, log: (message: string) => void): Promise<{ didAddVitest: boolean }> {
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

import { IPkgUtils } from '../logic/pkgUtils';
import { ILogger } from '../utils/logger';

/**
 * Make sure the repo match the template
 */
export async function matchTemplate(logger: ILogger, pkg: IPkgUtils) {
  const KEEP_FILES = [
    '.git',
    'src',
    'tests',
    'README.md',
    // rebuildLockfile ? null : 'pnpm-lock.yaml',
    'design',
    'config.json',
    // forceInstall ? null : 'node_modules',
    config.viteExample ? 'example' : null,
    config.scripts ? 'scripts' : null,
    ...config.keep,
  ].filter(Boolean);
}

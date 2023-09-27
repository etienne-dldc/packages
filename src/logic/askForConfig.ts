import pc from 'picocolors';
import { ILogger } from '../utils/logger';

export interface IConfig {
  forceInstall: boolean;
  rebuildLockfile: boolean;
  checkOudated: boolean;
  checkCleanBefore: boolean;
  checkCleanAfter: boolean;
  checkPendingRelease: boolean;
}

export async function askForConfig(logger: ILogger): Promise<IConfig> {
  logger.log(`${pc.bgBlue(' TODO ')} ask for config, preset ?`);
  return {
    forceInstall: true,
    rebuildLockfile: true,
    checkOudated: true,
    checkCleanBefore: true,
    checkCleanAfter: true,
    checkPendingRelease: true,
  };
}

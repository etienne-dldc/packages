import { execaCommand } from 'execa';
import { PkgStack, TGlobalConfig } from './logic/PkgStack';
import { packages } from './packages';
import { input } from './prompts/input';
import { Logger } from './utils/logger';

main().catch(console.error);

async function main() {
  const globalConfig: TGlobalConfig = { runMode: 'ask' };

  const logger = Logger.create();
  const command = await input(logger, { message: 'Command' });
  for (const pkgBase of packages) {
    const pkg = PkgStack.create(logger, pkgBase, globalConfig);
    if (pkg.skipped) {
      continue;
    }
    logger.log(pkg.base.coloredName);
    await execaCommand(command, { cwd: pkg.base.folder, verbose: false });
  }
}

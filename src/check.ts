import { confirm } from '@inquirer/prompts';
import { $ } from 'execa';
import pc from 'picocolors';
import yargs from 'yargs';
import { CheckResult, checkPackage } from './check/checkPackage';
import { IPackage } from './packages';
import { Logger } from './utils/logger';
import { pkgUtils } from './utils/pkgUtils';
import { selectPackages } from './utils/selectPackages';

const paramsParser = yargs(process.argv.slice(2))
  .scriptName('check')
  .option('all', { type: 'boolean', default: false })
  .option('sequence', { type: 'boolean', default: false });

main().catch(console.error);

async function main() {
  const params = await paramsParser.argv;

  const selectedPackages = await selectPackages(params.all);

  const results: CheckResult[] = [];

  if (selectedPackages.length === 1) {
    const pkg = selectedPackages[0];
    const res = await handlePackage(pkg, false);
    results.push(res);
  } else if (params.sequence) {
    for (const pkg of selectedPackages) {
      const res = await handlePackage(pkg, false);
      results.push(res);
    }
  } else {
    const res = await Promise.all(
      selectedPackages.map(async (pkg, index) => {
        await new Promise((resolve) => setTimeout(resolve, index * 100));
        return await handlePackage(pkg, true);
      })
    );
    results.push(...res);
  }
  if (results.some((res) => !res.success)) {
    console.log(`${pc.red('◆')} Some packages failed`);
    const shouldOpen = await confirm({
      message: `Open failed packages in VSCode?`,
    });
    if (shouldOpen) {
      for (const res of results) {
        if (!res.success) {
          const { folder } = pkgUtils(res.pkg);
          await $`code ${folder}`;
        }
      }
    }
  }
  console.log(`${pc.green('◆')} Done`);
}

async function handlePackage(pkg: IPackage, deffered: boolean): Promise<CheckResult> {
  const logger = Logger.create({ deffered });
  try {
    const result = await checkPackage(logger, pkg, !deffered);
    if (deffered) {
      logger.commit();
    }
    return result;
  } catch (error) {
    if (deffered) {
      logger.commit();
    }
    console.error(error);
    return { success: false, pkg };
  }
}

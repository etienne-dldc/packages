import pc from 'picocolors';
import yargs from 'yargs';
import { checkPackage } from './check/checkPackage';
import { IPackage } from './packages';
import { Logger } from './utils/logger';
import { selectPackages } from './utils/selectPackages';

const paramsParser = yargs(process.argv.slice(2))
  .scriptName('check')
  .option('all', { type: 'boolean', default: false })
  .option('sequence', { type: 'boolean', default: false });

main().catch(console.error);

async function main() {
  const params = await paramsParser.argv;

  const selectedPackages = await selectPackages(params.all);

  if (selectedPackages.length === 1) {
    const pkg = selectedPackages[0];
    await handlePackage(pkg, false);
    return;
  }

  if (params.sequence) {
    for (const pkg of selectedPackages) {
      await handlePackage(pkg, false);
    }
  } else {
    await Promise.all(
      selectedPackages.map(async (pkg, index) => {
        await new Promise((resolve) => setTimeout(resolve, index * 100));
        await handlePackage(pkg, true);
      })
    );
  }

  console.log(`${pc.green('◆')} Done`);
}

async function handlePackage(pkg: IPackage, deffered: boolean) {
  const logger = Logger.create({ deffered });
  try {
    await checkPackage(logger, pkg);
    if (deffered) {
      logger.commit();
    }
  } catch (error) {
    if (deffered) {
      logger.commit();
    }
    console.error(error);
  }
}

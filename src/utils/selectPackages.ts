import { select } from '@inquirer/prompts';
import { PackageName, packages } from '../packages';

export async function selectPackages(all: boolean) {
  if (all) {
    return packages;
  }

  const selected = await select<PackageName | 'all'>({
    message: 'Select packages to check',
    choices: [
      ...packages.map((pkg) => ({
        value: pkg.name,
        name: `${pkg.org}/${pkg.name}`,
      })),
    ],
  });

  return packages.filter((pkg) => pkg.name === selected);
}

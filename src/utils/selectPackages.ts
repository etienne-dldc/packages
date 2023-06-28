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
        value: pkg.repository,
        name: `${pkg.org}/${pkg.repository}`,
      })),
    ],
  });

  return packages.filter((pkg) => pkg.repository === selected);
}

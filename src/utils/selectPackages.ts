import { select } from '@inquirer/prompts';
import { PackageName, packages } from '../packages';

export async function selectPackages() {
  const selected = await select<PackageName | 'all'>({
    message: 'Select packages to check',
    choices: [
      { value: 'all', name: 'All' },
      ...packages.map((pkg) => ({
        value: pkg.name,
        name: `${pkg.org}/${pkg.name}`,
      })),
    ],
  });

  const selectedPackages = selected === 'all' ? packages : packages.filter((pkg) => pkg.name === selected);

  return selectedPackages;
}

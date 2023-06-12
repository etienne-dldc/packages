import { packages } from '../packages';
import { Option, select } from '../prompts/select';

export async function selectPackages() {
  const selected = await select<Option<number | string>[], number | string>({
    message: 'Select packages to check',
    options: [
      { value: 'all', label: 'All' },
      ...packages.map((pkg, index) => ({
        value: index,
        label: `${pkg.org}/${pkg.name}`,
      })),
    ],
  });

  const selectedPackages = selected === 'all' ? packages : [packages[selected as number]];

  return selectedPackages;
}

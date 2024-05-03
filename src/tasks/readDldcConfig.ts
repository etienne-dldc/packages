import { Key } from '@dldc/stack';
import { PkgStack } from '../logic/PkgStack';
import { IDldcConfigResolved, PackageJsonKey } from './readPackageJson';

const DEFAULT_DLDC_CONFIG: IDldcConfigResolved = {
  additionalDevDependencies: [],
  react: false,
  viteExample: false,
  vitestSetupFile: false,
  vitestSingleThread: false,
  scripts: false,
  skipLibCheck: false,
  gitignore: [],
  keep: [],
  monorepo: null,
};

export const DldcConfigKey = Key.create<IDldcConfigResolved>('DldcConfig');

export async function readDldcConfig(pkg: PkgStack): Promise<PkgStack> {
  const packageJson = pkg.getOrFail(PackageJsonKey.Consumer);
  const dldcConfig: IDldcConfigResolved = { ...DEFAULT_DLDC_CONFIG, ...packageJson.dldc };
  return pkg.with(DldcConfigKey.Provider(dldcConfig));
}

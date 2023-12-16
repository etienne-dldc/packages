import { PackageJson } from 'types-package-json';
import { IDldcConfig } from '../tasks/readPackageJson';

export interface IPackageJsonFixed extends PackageJson {
  sideEffects: boolean;
  exports: Record<string, Record<'import' | 'require' | 'types', string>>;
  type: string;
  types: string;
  packageManager: string;
  publishConfig: {
    access: string;
    registry: string;
  };
  'release-it': any;
  eslintConfig: any;
  prettier: any;
  dldc?: IDldcConfig;
}

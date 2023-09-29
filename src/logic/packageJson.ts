import { PackageJson } from 'types-package-json';
import { IDldcConfig } from './validateDldcConfig';

export interface IPackageJsonFixed extends PackageJson {
  sideEffects: boolean;
  exports: Record<string, Record<string, string>>;
  module: string;
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

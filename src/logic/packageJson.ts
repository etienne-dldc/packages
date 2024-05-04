import { PackageJson } from 'types-package-json';

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
}

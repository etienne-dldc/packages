export type Org = 'etienne-dldc' | 'instant-api' | 'dldc-packages';

export interface IPackage {
  readonly repository: string;
  readonly org: Org;
}

export type Packages = readonly IPackage[];

export type PackageName = (typeof packages)[number]['repository'];

export const packages = [
  { org: 'dldc-packages', repository: 'chemin' },
  { org: 'dldc-packages', repository: 'democrat' },
  { org: 'dldc-packages', repository: 'docsy' },
  { org: 'dldc-packages', repository: 'draaw' },
  { org: 'dldc-packages', repository: 'erreur' },
  { org: 'dldc-packages', repository: 'formi' },
  { org: 'dldc-packages', repository: 'humpf' },
  { org: 'dldc-packages', repository: 'interpolated-colors' },
  { org: 'dldc-packages', repository: 'interpolated-material-colors' },
  { org: 'dldc-packages', repository: 'jsx-linear-parser' },
  { org: 'dldc-packages', repository: 'literal-parser' },
  { org: 'dldc-packages', repository: 'mappemonde' },
  { org: 'dldc-packages', repository: 'miid' },
  { org: 'dldc-packages', repository: 'react-formi' },
  { org: 'dldc-packages', repository: 'staack' },
  { org: 'dldc-packages', repository: 'stachine' },
  { org: 'dldc-packages', repository: 'suub' },
  { org: 'dldc-packages', repository: 'ts-fonts' },
  { org: 'dldc-packages', repository: 'zen-serve' },
  { org: 'dldc-packages', repository: 'zendb-better-sqlite3' },
  { org: 'dldc-packages', repository: 'zendb-sqljs' },
  { org: 'dldc-packages', repository: 'zendb' },
  { org: 'dldc-packages', repository: 'zenjson' },
  { org: 'dldc-packages', repository: 'zensqlite' },
  { org: 'etienne-dldc', repository: 'umbrella-common' },
] as const satisfies Packages;

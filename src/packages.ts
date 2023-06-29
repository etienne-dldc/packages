export type Org = 'etienne-dldc' | 'instant-api' | 'dldc-packages';

export interface IPackage {
  readonly repository: string;
  readonly org: Org;
}

export type Packages = readonly IPackage[];

export type PackageName = (typeof packages)[number]['repository'];

export const packages = [
  { org: 'dldc-packages', repository: 'erreur' },
  { org: 'dldc-packages', repository: 'formi' },
  { org: 'dldc-packages', repository: 'miid' },
  { org: 'dldc-packages', repository: 'suub' },
  { org: 'dldc-packages', repository: 'zendb' },
  { org: 'etienne-dldc', repository: 'chemin' },
  { org: 'etienne-dldc', repository: 'democrat' },
  { org: 'etienne-dldc', repository: 'docsy' },
  { org: 'etienne-dldc', repository: 'draaw' },
  { org: 'etienne-dldc', repository: 'humpf' },
  { org: 'etienne-dldc', repository: 'interpolated-colors' },
  { org: 'etienne-dldc', repository: 'interpolated-material-colors' },
  { org: 'etienne-dldc', repository: 'jsx-linear-parser' },
  { org: 'etienne-dldc', repository: 'literal-parser' },
  { org: 'etienne-dldc', repository: 'mappemonde' },
  { org: 'etienne-dldc', repository: 'react-formi' },
  { org: 'etienne-dldc', repository: 'staack' },
  { org: 'etienne-dldc', repository: 'stachine' },
  { org: 'etienne-dldc', repository: 'ts-fonts' },
  { org: 'etienne-dldc', repository: 'umbrella-common' },
  { org: 'etienne-dldc', repository: 'zen-serve' },
  { org: 'etienne-dldc', repository: 'zendb-better-sqlite3' },
  { org: 'etienne-dldc', repository: 'zendb-sqljs' },
  { org: 'etienne-dldc', repository: 'zenjson' },
  { org: 'etienne-dldc', repository: 'zensqlite' },
] as const satisfies Packages;

export type Org = 'etienne-dldc' | 'instant-api';

export interface IPackage {
  readonly repository: string;
  readonly org: Org;
  readonly deprecated?: boolean;
}

export type Packages = readonly IPackage[];

export type PackageName = (typeof packages)[number]['repository'];

export const packages = [
  { org: 'etienne-dldc', repository: 'zensqlite' },
  { org: 'etienne-dldc', repository: 'stachine' },
  { org: 'etienne-dldc', repository: 'draaw' },
  { org: 'etienne-dldc', repository: 'docsy' },
  { org: 'etienne-dldc', repository: 'mappemonde' },
  { org: 'etienne-dldc', repository: 'miid' },
  { org: 'etienne-dldc', repository: 'literal-parser' },
  { org: 'etienne-dldc', repository: 'jsx-linear-parser' },
  { org: 'etienne-dldc', repository: 'interpolated-material-colors' },
  { org: 'etienne-dldc', repository: 'interpolated-colors' },
  { org: 'etienne-dldc', repository: 'humpf' },
  { org: 'etienne-dldc', repository: 'staack' },
  { org: 'etienne-dldc', repository: 'erreur' },
  { org: 'etienne-dldc', repository: 'suub' },
  { org: 'etienne-dldc', repository: 'zenjson' },
  { org: 'etienne-dldc', repository: 'chemin' },
  { org: 'etienne-dldc', repository: 'democrat' },
  { org: 'etienne-dldc', repository: 'react-formi' },
  { org: 'etienne-dldc', repository: 'zen-serve' },
  { org: 'etienne-dldc', repository: 'formi' },
  { org: 'etienne-dldc', repository: 'ts-fonts' },
  { org: 'etienne-dldc', repository: 'zendb' },
  { org: 'etienne-dldc', repository: 'zendb-better-sqlite3' },
  { org: 'etienne-dldc', repository: 'zendb-sqljs' },
  { org: 'etienne-dldc', repository: 'umbrella-common' },
] as const satisfies Packages;

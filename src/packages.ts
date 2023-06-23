export type Org = 'etienne-dldc' | 'instant-api';

export interface IPackage {
  readonly name: string;
  readonly org: Org;
  readonly deprecated?: boolean;
}

export type Packages = readonly IPackage[];

export type PackageName = (typeof packages)[number]['name'];

export const packages = [
  { org: 'etienne-dldc', name: 'zensqlite' },
  { org: 'etienne-dldc', name: 'stachine' },
  { org: 'etienne-dldc', name: 'draaw' },
  { org: 'etienne-dldc', name: 'docsy' },
  { org: 'etienne-dldc', name: 'mappemonde' },
  { org: 'etienne-dldc', name: 'miid' },
  { org: 'etienne-dldc', name: 'literal-parser' },
  { org: 'etienne-dldc', name: 'jsx-linear-parser' },
  { org: 'etienne-dldc', name: 'interpolated-material-colors' },
  { org: 'etienne-dldc', name: 'interpolated-colors' },
  { org: 'etienne-dldc', name: 'humpf' },
  { org: 'etienne-dldc', name: 'staack' },
  { org: 'etienne-dldc', name: 'erreur' },
  { org: 'etienne-dldc', name: 'suub' },
  { org: 'etienne-dldc', name: 'zenjson' },
  { org: 'etienne-dldc', name: 'chemin' },
  { org: 'etienne-dldc', name: 'democrat' },
  { org: 'etienne-dldc', name: 'react-formi' },
  { org: 'etienne-dldc', name: 'zen-serve' },
  { org: 'etienne-dldc', name: 'formi' },
  { org: 'etienne-dldc', name: 'ts-fonts' },
  { org: 'etienne-dldc', name: 'zendb' },
  { org: 'etienne-dldc', name: 'zendb-better-sqlite3' },
  { org: 'etienne-dldc', name: 'zendb-sqljs' },
] as const satisfies Packages;

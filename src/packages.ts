export type Org = 'etienne-dldc' | 'instant-api' | 'dldc-packages';

export interface IPackage {
  readonly repository: string;
  readonly org: Org;
  readonly disabled?: boolean;
}

export type Packages = readonly IPackage[];

export type PackageName = (typeof packages)[number]['repository'];

export const packages = [
  { org: 'dldc-packages', repository: 'compose' },
  { org: 'dldc-packages', repository: 'stack' },
  { org: 'dldc-packages', repository: 'mappemonde' },
  { org: 'dldc-packages', repository: 'erreur' },
  { org: 'dldc-packages', repository: 'pubsub' },
  { org: 'dldc-packages', repository: 'stachine' },
  { org: 'dldc-packages', repository: 'zenjson' },
  { org: 'dldc-packages', repository: 'rsync' },
  { org: 'dldc-packages', repository: 'sqlite' },
  { org: 'dldc-packages', repository: 'humpf' },
  { org: 'dldc-packages', repository: 'colors' },
  { org: 'dldc-packages', repository: 'material-colors' },
  { org: 'dldc-packages', repository: 'canvas' },
  { org: 'dldc-packages', repository: 'chemin' },
  { org: 'dldc-packages', repository: 'democrat' },
  { org: 'dldc-packages', repository: 'docsy' },
  { org: 'dldc-packages', repository: 'fonts' },
  { org: 'dldc-packages', repository: 'formi' },

  { org: 'dldc-packages', repository: 'formi-react' },
  { org: 'dldc-packages', repository: 'jsx-linear-parser' },
  { org: 'dldc-packages', repository: 'literal-parser' },
  { org: 'dldc-packages', repository: 'serve' },
  { org: 'dldc-packages', repository: 'zendb-better-sqlite3' },
  { org: 'dldc-packages', repository: 'zendb-sqljs' },
  { org: 'dldc-packages', repository: 'zendb' },

  { org: 'etienne-dldc', repository: 'umbrella-common' },

  { org: 'dldc-packages', repository: 'icons-bundler', disabled: true },
  { org: 'dldc-packages', repository: 'local-sql', disabled: true },
  { org: 'dldc-packages', repository: 'react-lazy-icons', disabled: true },
] as const satisfies Packages;

export type Org = 'etienne-dldc' | 'instant-api';

export interface IPackage {
  readonly name: string;
  readonly org: Org;
  readonly additionalDevDependencies?: Record<string, string>;
  readonly browser?: boolean;
}

export const packages = [
  {
    org: 'etienne-dldc',
    name: 'zensqlite',
    additionalDevDependencies: {
      '@types/dedent': '^0.7.0',
      dedent: '^0.7.0',
      'sql-formatter': '^12.2.1',
    },
  },
  { org: 'etienne-dldc', name: 'stachine' },
  { org: 'etienne-dldc', name: 'draaw', browser: true },
  {
    org: 'etienne-dldc',
    name: 'docsy',
    additionalDevDependencies: {
      '@types/fs-extra': '^11.0.1',
      'fs-extra': '^11.1.1',
    },
  },
  { org: 'etienne-dldc', name: 'mappemonde' },
  { org: 'etienne-dldc', name: 'miid' },
  { org: 'etienne-dldc', name: 'literal-parser' },
  { org: 'etienne-dldc', name: 'jsx-linear-parser' },
  { org: 'etienne-dldc', name: 'interpolated-material-colors' },
  {
    org: 'etienne-dldc',
    name: 'interpolated-colors',
    additionalDevDependencies: { '@types/color': '^3.0.3' },
  },
  {
    org: 'etienne-dldc',
    name: 'humpf',
    additionalDevDependencies: { canvas: '^2.11.0' },
  },
  { org: 'etienne-dldc', name: 'staack' },
  { org: 'etienne-dldc', name: 'erreur' },
  { org: 'etienne-dldc', name: 'suub' },
  { org: 'etienne-dldc', name: 'zenjson' },
] as const satisfies readonly IPackage[];

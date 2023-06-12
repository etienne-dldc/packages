export type Org = 'etienne-dldc' | 'instant-api';

export interface IPackage {
  readonly name: string;
  readonly org: Org;
  readonly deno?: boolean;
  readonly additionalDevDependencies?: Record<string, string>;
  readonly browser?: boolean;
}

export const packages = [
  {
    org: 'etienne-dldc',
    name: 'zensqlite',
    deno: true,
    additionalDevDependencies: {
      '@types/dedent': '^0.7.0',
      dedent: '^0.7.0',
      'sql-formatter': '^12.2.1',
    },
  },
  { org: 'etienne-dldc', name: 'stachine', deno: true },
  { org: 'etienne-dldc', name: 'draaw', browser: true },
  {
    org: 'etienne-dldc',
    name: 'docsy',
    deno: true,
    additionalDevDependencies: {
      '@types/fs-extra': '^11.0.1',
      'fs-extra': '^11.1.1',
    },
  },
  { org: 'etienne-dldc', name: 'mappemonde', deno: true },
  { org: 'etienne-dldc', name: 'miid', deno: true },
  { org: 'etienne-dldc', name: 'literal-parser', deno: true },
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
    deno: true,
    additionalDevDependencies: { canvas: '^2.11.0' },
  },
  { org: 'etienne-dldc', name: 'staack', deno: true },
  { org: 'etienne-dldc', name: 'erreur', deno: true },
  { org: 'etienne-dldc', name: 'suub', deno: true },
  { org: 'etienne-dldc', name: 'zenjson', deno: true },
] as const satisfies readonly IPackage[];

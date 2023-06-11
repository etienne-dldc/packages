export type Org = 'etienne-dldc' | 'instant-api';

export interface IPackage {
  readonly name: string;
  readonly org: Org;
  readonly deno?: boolean;
  readonly additionalDevDependencies?: Record<string, string>;
}

export const packages = [
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

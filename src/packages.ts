export type Org = 'etienne-dldc' | 'instant-api';

export interface IPackage {
  readonly name: string;
  readonly org: Org;
  readonly deno?: boolean;
}

export const packages = [
  { org: 'etienne-dldc', name: 'staack', deno: true },
  { org: 'etienne-dldc', name: 'erreur', deno: true },
  { org: 'etienne-dldc', name: 'suub', deno: true },
] as const satisfies readonly IPackage[];

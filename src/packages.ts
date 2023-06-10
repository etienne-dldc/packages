export type Org = "etienne-dldc" | "instant-api";

export interface Package {
  readonly name: string;
  readonly org: Org;
}

export const packages = [
  { org: "etienne-dldc", name: "staack" },
  { org: "etienne-dldc", name: "erreur" },
  { org: "etienne-dldc", name: "suub" },
] as const satisfies readonly Package[];

export type Org = "etienne-dldc" | "instant-api" | "dldc-packages";

export interface IPackage {
  readonly repository: string;
  readonly org: Org;
  readonly disabled?: boolean;
}

export type Packages = readonly IPackage[];

export type PackageName = (typeof packages)[number]["repository"];

export const packages = [
  { org: "dldc-packages", repository: "erreur", disabled: true },
  { org: "dldc-packages", repository: "stack", disabled: true },
  { org: "dldc-packages", repository: "compose", disabled: true },
  { org: "dldc-packages", repository: "mappemonde", disabled: true },
  { org: "dldc-packages", repository: "pubsub", disabled: true },
  { org: "dldc-packages", repository: "stachine", disabled: true },
  { org: "dldc-packages", repository: "zenjson", disabled: true },
  { org: "dldc-packages", repository: "file", disabled: true },
  { org: "dldc-packages", repository: "rsync", disabled: true },
  { org: "dldc-packages", repository: "sqlite", disabled: true },
  { org: "dldc-packages", repository: "humpf", disabled: true },
  { org: "dldc-packages", repository: "colors", disabled: true },
  { org: "dldc-packages", repository: "material-colors", disabled: true },
  { org: "dldc-packages", repository: "canvas", disabled: true },
  { org: "dldc-packages", repository: "chemin", disabled: true },
  { org: "dldc-packages", repository: "democrat" },
  { org: "dldc-packages", repository: "docsy", disabled: true },
  { org: "dldc-packages", repository: "fonts" },
  { org: "dldc-packages", repository: "formi", disabled: true },
  { org: "dldc-packages", repository: "formi-react" },
  { org: "dldc-packages", repository: "literal-parser" },
  { org: "dldc-packages", repository: "jsx-linear-parser" },
  { org: "dldc-packages", repository: "serve", disabled: true },
  { org: "dldc-packages", repository: "zendb", disabled: true },
  { org: "dldc-packages", repository: "zendb-better-sqlite3" },
  { org: "dldc-packages", repository: "zendb-sqljs" },
  { org: "dldc-packages", repository: "zenapi", disabled: true },

  { org: "dldc-packages", repository: "icons-bundler", disabled: true },
  { org: "dldc-packages", repository: "local-sql", disabled: true },
  { org: "dldc-packages", repository: "react-lazy-icons", disabled: true },
] as const satisfies Packages;

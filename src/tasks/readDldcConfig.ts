import { createKey } from "@dldc/stack";
import { exists } from "@std/fs";
import { resolve } from "@std/path";
import * as v from "@valibot/valibot";
import pc from "picocolors";
import { PkgStack } from "../logic/PkgStack.ts";
import { RETRY } from "../utils/pipeIfWithRetry.ts";

const DldcConfigSchema = v.strictObject({
  additionalDevDependencies: v.optional(v.array(v.string())),
  react: v.optional(v.boolean()), // add eslint-plugin-react-hooks, enable jsx in tsconfig
  viteExample: v.optional(v.boolean()), // example folder with vite
  vitestSetupFile: v.optional(v.boolean()), // add setup file for vitest
  scripts: v.optional(v.boolean()), // add scripts to package.json (and install tsx)
  // disable threads for vitest (used by @dldc/canvas)
  // needed for canvas https://github.com/vitest-dev/vitest/issues/740
  vitestSingleThread: v.optional(v.boolean()),
  skipLibCheck: v.optional(v.boolean()), // add skipLibCheck to tsconfig
  gitignore: v.optional(v.array(v.string())), // stuff to add to .gitignore
  keep: v.optional(v.array(v.string())), // files / folders to keep
  monorepo: v.nullable(v.optional(v.array(v.string()))), // monorepo packages glob
});

export type IDldcConfig = v.InferOutput<typeof DldcConfigSchema>;

export type IDldcConfigResolved = Required<IDldcConfig>;

const DEFAULT_DLDC_CONFIG: IDldcConfigResolved = {
  additionalDevDependencies: [],
  react: false,
  viteExample: false,
  vitestSetupFile: false,
  vitestSingleThread: false,
  scripts: false,
  skipLibCheck: false,
  gitignore: [],
  keep: [],
  monorepo: null,
};

export const DldcConfigKey = createKey<IDldcConfigResolved>("DldcConfig");

export async function readDldcConfig(pkg: PkgStack): Promise<PkgStack> {
  const logger = pkg.base.logger;
  const dldcConfigPath = resolve(pkg.base.folder, ".dldc.json");
  if (!exists(dldcConfigPath)) {
    logger.log(`${pc.blue("◆")} No .dldc.json file found`);
    return pkg.with(DldcConfigKey.Provider(DEFAULT_DLDC_CONFIG));
  }
  const content = JSON.parse(
    await Deno.readTextFile(resolve(pkg.base.folder, ".dldc.json"))
  );
  const dldcConfig = v.safeParse(DldcConfigSchema, content);
  if (!dldcConfig.success) {
    logger.log(`${pc.red("◆")} Invalid "dldc" config in package.json`);
    logger.log(`${pc.red("◆")} ${dldcConfig.issues}`);
    throw RETRY;
  }
  logger.log(`${pc.blue("◆")} Valid .dldc.json file found`);
  const dldcConfigResolved: IDldcConfigResolved = {
    ...DEFAULT_DLDC_CONFIG,
    ...dldcConfig.output,
  };
  return pkg.with(DldcConfigKey.Provider(dldcConfigResolved));
}

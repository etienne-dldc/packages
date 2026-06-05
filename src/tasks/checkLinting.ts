import pc from "picocolors";
import { PkgStack } from "../logic/PkgStack.ts";
import { RETRY } from "../utils/pipeIfWithRetry.ts";

export async function checkLinting(pkg: PkgStack): Promise<PkgStack> {
  const { logger, $$ } = pkg.base;
  try {
    await $$`pnpm run lint:fix`;
  } catch {
    logger.log(`${pc.red("◆")} Linting failed`);
    throw RETRY;
  }
  logger.log(`${pc.blue("◆")} Linting passed`);
  return pkg;
}

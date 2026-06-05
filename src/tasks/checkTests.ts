import pc from "picocolors";
import { PkgStack } from "../logic/PkgStack.ts";
import { RETRY } from "../utils/pipeIfWithRetry.ts";

export async function checkTests(pkg: PkgStack): Promise<PkgStack> {
  const { logger, $$ } = pkg.base;
  try {
    await $$`pnpm test`;
  } catch {
    logger.log(`${pc.red("◆")} Tests failed`);
    throw RETRY;
  }
  logger.log(`${pc.blue("◆")} Tests passed`);
  return pkg;
}

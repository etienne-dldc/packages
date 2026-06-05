import pc from "picocolors";
import { PkgStack, TGlobalConfig } from "./logic/PkgStack.ts";
import { IPackage, packages } from "./packages.ts";
import { confirm } from "./prompts/confirm.ts";
import { expand } from "./prompts/expand.ts";
import { select } from "./prompts/select.ts";
import { checkBuild } from "./tasks/checkBuild.ts";
import { checkCleanGig } from "./tasks/checkCleanGig.ts";
import { checkDependencies } from "./tasks/checkDependencies.ts";
import { checkLinting } from "./tasks/checkLinting.ts";
import { checkOudated } from "./tasks/checkOudated.ts";
import { checkPackageOrder } from "./tasks/checkPackageOrder.ts";
import { checkPendingRelease } from "./tasks/checkPendingRelease.ts";
import { checkTests } from "./tasks/checkTests.ts";
import { checkTypes } from "./tasks/checkTypes.ts";
import { ensureCloned } from "./tasks/ensureCloned.ts";
import { matchTemplate } from "./tasks/matchTemplate.ts";
import { readDldcConfig } from "./tasks/readDldcConfig.ts";
import { readPackageJson } from "./tasks/readPackageJson.ts";
import { asyncMap } from "./utils/asyncMap.ts";
import { ILogger, Logger } from "./utils/logger.ts";
import { pipeIfWithRetry } from "./utils/pipeIfWithRetry.ts";

main().catch(console.error);

async function main() {
  const logger = Logger.create();

  const packagesToCheck = await selectPackages(logger);
  logger.log(`${pc.blue("◆")} ${packagesToCheck.length} packages`);

  const runMode = await selectRunMode(logger);
  logger.log(`${pc.blue("◆")} running in "${runMode}" mode`);

  const globalConfig: TGlobalConfig = { runMode };

  // All packages
  const pkgsBase = packagesToCheck
    .map((pkg) => PkgStack.create(logger, pkg, globalConfig))
    .filter((pkg) => !pkg.skipped);
  const pkgsCloned = await asyncMap(pkgsBase, (pkg) => ensureCloned(pkg));
  pkgsCloned.forEach((pkg) => pkg.base.logger.reset());
  const pkgsReady = await pipeIfWithRetry(pkgsCloned, {
    condition: (pkg) => skippedCondition(pkg),
    steps: [readPackageJson, readDldcConfig, checkCleanGig],
    onRetry: onError,
  });
  await checkPackageOrder(pkgsReady);
  pkgsReady.forEach((pkg) => pkg.base.logger.reset());
  const pkgsDone = await pipeIfWithRetry(pkgsReady, {
    condition: (pkg) => skippedCondition(pkg, { silent: true }),
    steps: [
      readPackageJson,
      readDldcConfig,
      checkDependencies,
      matchTemplate,
      checkCleanGig,
      checkOudated,
      checkLinting,
      checkTypes,
      checkBuild,
      checkTests,
      checkPendingRelease,
      checkCleanGig,
    ],
    onRetry: onError,
  });
  logger.log(`${pc.blue("◆")} Done (${pkgsDone.length} packages)`);
}

function skippedCondition(
  pkg: PkgStack,
  { silent = false }: { silent?: boolean } = {}
) {
  if (pkg.skipped) {
    if (!silent) {
      pkg.base.logger.log(`${pc.red("◆ Skipped")} ${pkg.base.coloredName}`);
    }
    return false;
  }
  return true;
}

async function onError(pkg: PkgStack) {
  await confirm(pkg.base.logger, { message: `Confirm to try again` });
}

async function selectPackages(logger: ILogger): Promise<readonly IPackage[]> {
  const mode = await expand(logger, {
    message: "Select mode",
    expanded: true,
    choices: [
      { key: "a", name: "All", value: "all" },
      { key: "s", name: "Select", value: "select" },
    ],
  });
  if (mode === "all") {
    return packages;
  }
  const start = await select(logger, {
    message: "Select start package",
    choices: packages.map((pkg) => ({ name: pkg.repository, value: pkg })),
  });
  return packages.slice(packages.indexOf(start));
}

async function selectRunMode(logger: ILogger): Promise<"ask" | "skip"> {
  const mode = await expand(logger, {
    message: "Select run mode",
    expanded: true,
    choices: [
      { key: "a", name: "Ask", value: "ask" },
      { key: "s", name: "Skip", value: "skip" },
    ],
  });
  return mode;
}

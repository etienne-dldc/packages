import { Key, Stack, TStackCoreValue } from '@dldc/stack';
import { $, Execa$ } from 'execa';
import { relative, resolve } from 'path';
import pc from 'picocolors';
import { IPackage, Org } from '../packages';
import { ILogger } from '../utils/logger';

export interface IPkgBase {
  readonly repository: string;
  readonly org: Org;
  readonly disabled: boolean;
  readonly prefix: string;
  readonly folder: string;
  readonly relativeFolder: string;
  readonly coloredName: string;
  readonly $$: Execa$;
  readonly logger: ILogger;
}

export interface TGlobalConfig {
  lastCommitMessage?: string;
}

export const PkgBaseKey = Key.create<IPkgBase>('PkgBase');
export const SkippedKey = Key.create<boolean>('Skipped');
export const GlobalConfigKey = Key.create<TGlobalConfig>('GlobalConfig');

export class PkgStack extends Stack {
  static create(logger: ILogger, pkg: IPackage, globalConfig: TGlobalConfig): PkgStack {
    const base = pkgBase(logger, pkg);
    return new PkgStack().with(
      PkgBaseKey.Provider(base),
      SkippedKey.Provider(base.disabled),
      GlobalConfigKey.Provider(globalConfig),
    );
  }

  get base(): IPkgBase {
    return this.getOrFail(PkgBaseKey.Consumer);
  }

  get skipped(): boolean {
    return this.getOrFail(SkippedKey.Consumer);
  }

  get globalConfig(): TGlobalConfig {
    return this.getOrFail(GlobalConfigKey.Consumer);
  }

  skip(): this {
    return this.with(SkippedKey.Provider(true));
  }

  protected instantiate(stackCore: TStackCoreValue): this {
    return new PkgStack(stackCore) as any;
  }
}

function pkgBase(parentLogger: ILogger, pkg: IPackage): IPkgBase {
  const coloredName = `${pc.blue(pkg.org)}/${pc.green(pkg.repository)}`;
  const baseDir = resolve(`${process.env.HOME}/Workspace`);
  const folder = resolve(baseDir, `github.com/${pkg.org}/${pkg.repository}`);
  const prefix = ` ${pc.gray('│')} `;
  const relativeFolder = relative(baseDir, folder);
  const logger = parentLogger.child(prefix, [coloredName, prefix + pc.gray(folder)]);
  return {
    ...pkg,
    prefix,
    folder,
    relativeFolder,
    coloredName,
    disabled: pkg.disabled ?? false,
    logger,
    $$: $({ cwd: folder, verbose: false }),
  };
}

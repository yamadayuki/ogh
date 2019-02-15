import * as cosmiconfig from "cosmiconfig";
import { resolve } from "path";
import { DEFAULT_SCRIPT_PATH, GIT_HOOKS, Hook, installHooks, isGitHook, uninstallHooks } from "./gitHooks";

interface OghConstructorParams {
  packageName: string;
  scriptPath?: string;
  hooks?: Hook[];
}

class Ogh {
  private packageName!: string;
  private scriptPath?: string;
  private hooks: Hook[];
  private performHook!: (args: typeof process.argv) => void;

  public constructor({ packageName, scriptPath, hooks }: OghConstructorParams) {
    this.packageName = packageName;
    this.scriptPath = scriptPath || DEFAULT_SCRIPT_PATH;
    this.hooks = hooks || GIT_HOOKS;
    this.performHook = _ => {};
  }

  public registerPerformHook(fn: (args: typeof process.argv, config: cosmiconfig.Config) => void) {
    const result = cosmiconfig(this.packageName).searchSync();

    this.performHook = args => fn(args, result ? result.config : {});
    return this;
  }

  public parse(args: typeof process.argv) {
    const command = args[2];
    switch (command) {
      case "install": {
        installHooks(this.packageName, this.scriptPath, this.hooks);
        break;
      }
      case "uninstall": {
        uninstallHooks(this.packageName);
        break;
      }
      default: {
        if (this.performHook) {
          this.performHook(args);
        }
        break;
      }
    }
  }
}

export type EntrypointOption = Pick<OghConstructorParams, "scriptPath" | "hooks">;

export function entrypoint(packageName: string, opts: EntrypointOption = {}): Ogh {
  return new Ogh({ packageName, ...opts });
}

export function extractHookFromArgs(args: typeof process.argv) {
  if (args.length >= 3 && isGitHook(args[2])) {
    return args[2];
  } else {
    return "";
  }
}

export function extractCwdFromArgs(args: typeof process.argv) {
  return resolve(args[1].split("node_modules")[0]);
}

import * as cosmiconfig from "cosmiconfig";
import { installHooks, isGitHook, uninstallHooks } from "./gitHooks";

interface OghConstructorParams {
  packageName: string;
  scriptPath?: string;
}

class Ogh {
  private packageName!: string;
  private scriptPath?: string;
  private performHook!: (args: typeof process.argv) => void;

  public constructor({ packageName, scriptPath }: OghConstructorParams) {
    this.packageName = packageName;
    this.scriptPath = scriptPath;
    this.performHook = _ => {};
  }

  public registerPerformHook(
    fn: (args: typeof process.argv, config: cosmiconfig.Config) => void
  ) {
    const result = cosmiconfig(this.packageName).searchSync();

    this.performHook = args => fn(args, result ? result.config : {});
    return this;
  }

  public parse(args: typeof process.argv) {
    const command = args[2];
    switch (command) {
      case "install": {
        installHooks(this.packageName, this.scriptPath);
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

export function entrypoint(packageName: string, scriptPath?: string) {
  return new Ogh({ packageName, scriptPath });
}

export function extractHookFromArgs(args: typeof process.argv) {
  if (args.length >= 3 && isGitHook(args[2])) {
    return args[2];
  } else {
    return "";
  }
}

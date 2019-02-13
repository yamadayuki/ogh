import { installHooks, uninstallHooks } from "./gitHooks";

const performHook = () => {};

export function entrypoint(packageName: string, scriptPath?: string) {
  return {
    parse(args: typeof process.argv) {
      const command = args[2];
      switch (command) {
        case "install": {
          installHooks(packageName, scriptPath);
          break;
        }
        case "uninstall": {
          uninstallHooks();
          break;
        }
        default: {
          performHook();
          break;
        }
      }
    },
  };
}

import { installHooks, uninstallHooks } from "./gitHooks";

export function entrypoint(packageName: string) {
  return {
    parse(args: typeof process.argv) {
      const command = args[2];
      switch (command) {
        case "install": {
          installHooks(packageName);
          break;
        }
        case "uninstall": {
          uninstallHooks();
          break;
        }
      }
    },
  };
}

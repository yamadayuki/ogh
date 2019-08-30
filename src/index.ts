import { Cli, CommandClass, Command } from "clipanion";
import cosmiconfig from "cosmiconfig";
import { OghContext, OghParameters, OghBaseCommand } from "./baseCommand";
import { InstallCommand } from "./installer";
import { UninstallCommand } from "./uninstaller";
import { GIT_HOOKS, Hook } from "./gitHooks";

export function createCli({
  packageName,
  label,
  version,
  hookCommand,
}: {
  packageName: string;
  label?: string;
  version?: string;
  hookCommand: (cwd: string, args: string[], config: Record<string, any>) => void;
}) {
  const cli = new Cli<OghContext>({
    binaryLabel: label,
    binaryName: packageName,
    binaryVersion: version,
  });

  class HookCommand extends OghBaseCommand {
    @Command.Proxy()
    args: string[] = [];

    @Command.Path()
    async execute() {
      hookCommand(this.context.cwd, this.args, this.context.config);
    }
  }

  cli.register(InstallCommand);
  cli.register(UninstallCommand);
  cli.register(HookCommand);

  return cli;
}

export function perform(cli: Cli<OghContext>, options: OghParameters) {
  const result = cosmiconfig(options.packageName).searchSync();

  cli.runExit(process.argv.slice(2), {
    hooks: options.hooks,
    packageName: options.packageName,
    scriptPath: options.scriptPath,
    stderr: process.stderr,
    stdin: process.stdin,
    stdout: process.stdout,
    config: result ? result.config : {},
    cwd: process.cwd(),
  });
}

export { Command, GIT_HOOKS, Hook };

import { Cli, CommandClass, Command } from "clipanion";
import { OghContext, OghParameters } from "./baseCommand";
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
  hookCommand: CommandClass<OghContext>;
}) {
  const cli = new Cli<OghContext>({
    binaryLabel: label,
    binaryName: packageName,
    binaryVersion: version,
  });

  cli.register(InstallCommand);
  cli.register(UninstallCommand);
  cli.register(hookCommand);

  return cli;
}

export function perform(cli: Cli<OghContext>, options: OghParameters) {
  cli.runExit(process.argv.slice(2), {
    hooks: options.hooks,
    packageName: options.packageName,
    scriptPath: options.scriptPath,
    stderr: process.stderr,
    stdin: process.stdin,
    stdout: process.stdout,
  });
}

export { Command, GIT_HOOKS, Hook };

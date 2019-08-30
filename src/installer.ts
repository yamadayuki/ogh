import { Command } from "clipanion";
import { OghBaseCommand } from "./baseCommand";
import { installHooks } from "./gitHooks";

export class InstallCommand extends OghBaseCommand {
  @Command.Path("install")
  async execute() {
    installHooks(this.context.packageName, this.context.scriptPath, this.context.hooks);
  }
}

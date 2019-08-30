import { Command } from "clipanion";
import { OghBaseCommand } from "./baseCommand";
import { uninstallHooks } from "./gitHooks";

export class UninstallCommand extends OghBaseCommand {
  @Command.Path("uninstall")
  async execute() {
    uninstallHooks(this.context.packageName);
  }
}

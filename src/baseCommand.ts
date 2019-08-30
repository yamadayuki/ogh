import { Command, BaseContext } from "clipanion";
import { Hook } from "./gitHooks";

export interface OghParameters {
  packageName: string;
  scriptPath?: string;
  hooks?: Hook[];
}

export type OghContext = OghParameters & BaseContext;

export abstract class OghBaseCommand extends Command<OghContext> {
  @Command.Boolean("-v,--verbose")
  public verbose: boolean = false;

  abstract execute(): Promise<number | void>;
}

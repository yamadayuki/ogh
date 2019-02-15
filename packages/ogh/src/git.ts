import { execSync } from "child_process";
import { resolve } from "path";

export function getGitHooksDirectory(): string {
  return resolve(
    execSync("git rev-parse --git-path hooks")
      .toString()
      .trimRight()
  );
}

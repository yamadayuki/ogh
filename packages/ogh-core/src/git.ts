import { execSync } from "child_process";
import { resolve } from "path";

export function getDotGitDirectory(): string {
  return resolve(
    execSync("git rev-parse --git-dir")
      .toString()
      .trimRight()
  );
}

export function getGitHooksDirectory(): string {
  return resolve(
    execSync("git rev-parse --git-path hook")
      .toString()
      .trimRight()
  );
}

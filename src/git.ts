import { execSync } from "child_process";
import { resolve } from "path";

export function getGitHooksDirectory(): string {
  return resolve(
    execSync("git rev-parse --git-path hooks")
      .toString()
      .trimRight()
  );
}

/**
 * git rev-parse --is-inside-work-tree returns true when the current directory is inside
 */
export function isInsideGitRepository(cwd?: string): boolean {
  try {
    return Boolean(
      execSync("git rev-parse --is-inside-work-tree", { cwd })
        .toString()
        .trim()
    );
  } catch (err) {
    console.warn(err);
    return false;
  }
}

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
    execSync("git rev-parse --git-path hooks")
      .toString()
      .trimRight()
  );
}

export function getRootDirectory(): string {
  return resolve(getDotGitDirectory(), "..");
}

export function getStagedFiles(): string[] {
  return execSync("git diff --cached --name-only", { cwd: getRootDirectory() })
    .toString()
    .split("\n")
    .filter(s => s.length > 0);
}

export function getUnstagedFiles(): string[] {
  return execSync("git diff --name-only", { cwd: getRootDirectory() })
    .toString()
    .split("\n")
    .filter(s => s.length > 0);
}

export function stageFiles(files: string[]) {
  const filesStr = files.join(" ");

  execSync(`git add ${filesStr}`, { cwd: getRootDirectory() });
}

import { access, constants, unlink, writeFile } from "fs";
import { resolve } from "path";
import { getGitHooksDirectory } from "./git";

type Hook =
  | "applypatch-msg"
  | "commit-msg"
  | "fsmonitor-watchman"
  | "post-update"
  | "pre-applypatch"
  | "pre-commit"
  | "pre-push"
  | "pre-rebase"
  | "pre-receive"
  | "prepare-commit-msg"
  | "update";

const GIT_HOOKS: Hook[] = [
  "applypatch-msg",
  "commit-msg",
  "fsmonitor-watchman",
  "post-update",
  "pre-applypatch",
  "pre-commit",
  "pre-push",
  "pre-rebase",
  "pre-receive",
  "prepare-commit-msg",
  "update",
];

export function getGitHookFilepath(hookName: Hook): string {
  return resolve(getGitHooksDirectory(), hookName);
}

function render(
  packageName: string,
  hookName: string,
  scriptPath: string = "lib/index.js"
) {
  return `#!/bin/sh
scriptPath="node_modules/${packageName}/${scriptPath}"
hookName="${hookName}"
gitParams="$*"

if ! command -v node >/dev/null 2>&1; then
  echo "Can't find node in PATH, trying to find a node binary on your system"
fi
if [ -f $scriptPath ]; then
  node $scriptPath $hookName "$gitParams"
fi
`;
}

function createHook(packageName: string, hookName: Hook, scriptPath?: string) {
  writeFile(
    getGitHookFilepath(hookName),
    render(packageName, hookName, scriptPath),
    { flag: "w", mode: parseInt("0755", 8) },
    console.warn
  );
}

export function installHooks(packageName: string, scriptPath?: string) {
  GIT_HOOKS.forEach(hookName => {
    access(
      getGitHookFilepath(hookName),
      constants.W_OK | constants.X_OK,
      err => {
        // TODO: Support append mode if error code === 'ENOENT'
        // appendHook(packageName, hookName);
        if (err && err.code !== "ENOENT") {
          console.error(err);
          return;
        }

        return createHook(packageName, hookName, scriptPath);
      }
    );
  });
}

// TODO: Support package name to uninstall. We should uninstall using the removing codes instead of removing files.
export function uninstallHooks() {
  GIT_HOOKS.forEach(hookName => {
    unlink(getGitHookFilepath(hookName), console.warn);
  });
}

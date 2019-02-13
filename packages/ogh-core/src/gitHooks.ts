import { access, constants, readFile, readFileSync, writeFile } from "fs";
import { resolve } from "path";
import { getGitHooksDirectory } from "./git";

export type Hook =
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

export const GIT_HOOKS: Hook[] = [
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

export function isGitHook(str: string): str is Hook {
  return (GIT_HOOKS as string[]).includes(str);
}

export function getGitHookFilepath(hookName: Hook): string {
  return resolve(getGitHooksDirectory(), hookName);
}

function render(
  packageName: string,
  hookName: string,
  scriptPath: string = "lib/index.js",
  append: boolean = false
) {
  return `${append ? "" : "#!/bin/sh\n"}# DO NOT EDIT ${packageName} START

scriptPath="node_modules/${packageName}/${scriptPath}"
hookName="${hookName}"
gitParams="$*"

if ! command -v node >/dev/null 2>&1; then
  echo "Can't find node in PATH, trying to find a node binary on your system"
fi
if [ -f $scriptPath ]; then
  node $scriptPath $hookName "$gitParams"
fi

# DO NOT EDIT ${packageName} END
`;
}

function createHook(packageName: string, hookName: Hook, scriptPath?: string) {
  writeFile(
    getGitHookFilepath(hookName),
    render(packageName, hookName, scriptPath),
    { flag: "w", mode: parseInt("0755", 8) },
    err => {
      if (err) {
        console.error(err);
      }
    }
  );
}

function appendHook(packageName: string, hookName: Hook, scriptPath?: string) {
  writeFile(
    getGitHookFilepath(hookName),
    render(packageName, hookName, scriptPath, true),
    { flag: "a", mode: parseInt("0755", 8) },
    err => {
      if (err) {
        console.error(err);
      }
    }
  );
}

function removeHook(packageName: string, hookName: Hook) {
  const startComment = `# DO NOT EDIT ${packageName} START`;
  const endComment = `# DO NOT EDIT ${packageName} END`;

  readFile(getGitHookFilepath(hookName), "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    let newData: string[] = [];
    const lines = data.split("\n");
    let ignore = false;
    lines.forEach(line => {
      if (line === startComment) {
        ignore = true;
      }

      if (!ignore) {
        newData = newData.concat(line);
      }

      if (line === endComment) {
        ignore = false;
      }
    });

    writeFile(
      getGitHookFilepath(hookName),
      newData.join("\n"),
      { flag: "w", mode: parseInt("0755", 8) },
      err => {
        if (err) {
          console.error(err);
        }
      }
    );
  });
}

function checkInstalled(packageName: string, hookName: Hook) {
  const startComment = `# DO NOT EDIT ${packageName} START`;
  const endComment = `# DO NOT EDIT ${packageName} END`;

  try {
    const data = readFileSync(getGitHookFilepath(hookName), "utf8");
    return data.indexOf(startComment) !== -1 && data.indexOf(endComment) !== -1;
  } catch (_) {
    return false;
  }
}

export function installHooks(packageName: string, scriptPath?: string) {
  GIT_HOOKS.forEach(hookName => {
    if (checkInstalled(packageName, hookName)) {
      return;
    }

    access(
      getGitHookFilepath(hookName),
      constants.W_OK | constants.X_OK,
      err => {
        if (err) {
          if (err.code === "ENOENT") {
            createHook(packageName, hookName, scriptPath);
            return;
          } else {
            console.error(err);
            return;
          }
        }

        appendHook(packageName, hookName, scriptPath);
        return;
      }
    );
  });
}

export function uninstallHooks(packageName: string) {
  GIT_HOOKS.forEach(hookName => {
    if (!checkInstalled(packageName, hookName)) {
      return;
    }

    access(
      getGitHookFilepath(hookName),
      constants.R_OK | constants.W_OK | constants.X_OK,
      err => {
        if (err && err.code !== "ENOENT") {
          console.error(err);
          return;
        }

        removeHook(packageName, hookName);
      }
    );
    return;
  });
}

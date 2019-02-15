import { access, constants, readFile, readFileSync, writeFile } from "fs";
import { resolve } from "path";
import { getGitHooksDirectory } from "./git";

// see https://git-scm.com/docs/githooks
export type Hook =
  | "applypatch-msg" // https://git-scm.com/docs/githooks#_applypatch_msg
  | "pre-applypatch" // https://git-scm.com/docs/githooks#_pre_applypatch
  | "post-applypatch" // https://git-scm.com/docs/githooks#_post_applypatch
  | "pre-commit" // https://git-scm.com/docs/githooks#_pre_commit
  | "prepare-commit-msg" // https://git-scm.com/docs/githooks#_prepare_commit_msg
  | "commit-msg" // https://git-scm.com/docs/githooks#_commit_msg
  | "post-commit" // https://git-scm.com/docs/githooks#_post_commit
  | "pre-rebase" // https://git-scm.com/docs/githooks#_pre_rebase
  | "post-checkout" // https://git-scm.com/docs/githooks#_post_checkout
  | "post-merge" // https://git-scm.com/docs/githooks#_post_merge
  | "pre-push" // https://git-scm.com/docs/githooks#_pre_push
  | "pre-receive" // https://git-scm.com/docs/githooks#pre-receive
  | "update" // https://git-scm.com/docs/githooks#update
  | "post-receive" // https://git-scm.com/docs/githooks#post-receive
  | "post-update" // https://git-scm.com/docs/githooks#post-update
  | "push-to-checkout" // https://git-scm.com/docs/githooks#_push_to_checkout
  | "pre-auto-gc" // https://git-scm.com/docs/githooks#_pre_auto_gc
  | "post-rewrite" // https://git-scm.com/docs/githooks#_post_rewrite
  | "sendemail-validate" // https://git-scm.com/docs/githooks#_sendemail_validate
  | "fsmonitor-watchman" // https://git-scm.com/docs/githooks#_fsmonitor_watchman
  | "p4-pre-submit"; // https://git-scm.com/docs/githooks#_p4_pre_submit

export const GIT_HOOKS: Hook[] = [
  "applypatch-msg",
  "pre-applypatch",
  "post-applypatch",
  "pre-commit",
  "prepare-commit-msg",
  "commit-msg",
  "post-commit",
  "pre-rebase",
  "post-checkout",
  "post-merge",
  "pre-push",
  "pre-receive",
  "update",
  "post-receive",
  "post-update",
  "push-to-checkout",
  "pre-auto-gc",
  "post-rewrite",
  "sendemail-validate",
  "fsmonitor-watchman",
  "p4-pre-submit",
];

export const DEFAULT_SCRIPT_PATH = "lib/index.js";

export function isGitHook(str: string): str is Hook {
  return (GIT_HOOKS as string[]).includes(str);
}

export function getGitHookFilepath(hookName: Hook): string {
  return resolve(getGitHooksDirectory(), hookName);
}

function render(
  packageName: string,
  hookName: string,
  scriptPath: string = DEFAULT_SCRIPT_PATH,
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

    writeFile(getGitHookFilepath(hookName), newData.join("\n"), { flag: "w", mode: parseInt("0755", 8) }, err => {
      if (err) {
        console.error(err);
      }
    });
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

export function installHooks(packageName: string, scriptPath: string = DEFAULT_SCRIPT_PATH, hooks: Hook[] = GIT_HOOKS) {
  hooks.forEach(hookName => {
    if (checkInstalled(packageName, hookName)) {
      return;
    }

    access(getGitHookFilepath(hookName), constants.W_OK | constants.X_OK, err => {
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
    });
  });
}

export function uninstallHooks(packageName: string) {
  GIT_HOOKS.forEach(hookName => {
    if (!checkInstalled(packageName, hookName)) {
      return;
    }

    access(getGitHookFilepath(hookName), constants.R_OK | constants.W_OK | constants.X_OK, err => {
      if (err && err.code !== "ENOENT") {
        console.error(err);
        return;
      }

      removeHook(packageName, hookName);
    });
    return;
  });
}

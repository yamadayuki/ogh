import { resolve } from "path";
import pkgDir from "pkg-dir";

export async function extractGitRootDirFromArgs(args: typeof process.argv) {
  if (args.length >= 2 && args[1]) {
    const rootDir = await pkgDir(args[1]);

    if (rootDir) {
      return resolve(rootDir);
    }
  }
}

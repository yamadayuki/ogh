import { entrypoint, extractGitRootDirFromArgs, extractHookFromArgs } from "@yamadayuki/ogh";
import { command } from "execa";
import { readFileSync, writeFileSync } from "fs";
import { resolve, extname } from "path";
import { format, resolveConfig, getSupportInfo } from "prettier";

const SAMPLE_PRETTIER_CONFIG_FILE = resolve(__dirname, "..", ".prettierrc");

async function getStagedFiles(args: any) {
  const { stdout } = await command("git diff --cached --name-only", {
    cwd: extractGitRootDirFromArgs(args),
    shell: true,
  });

  return stdout.split("\n").filter(line => line.length > 0);
}

async function getUnstagedFiles(args: any) {
  const { stdout } = await command("git diff --name-only", { cwd: extractGitRootDirFromArgs(args), shell: true });
  return stdout.split("\n").filter(line => line.length > 0);
}

async function getDeletedFiles(args: any) {
  const { stdout } = await command("git diff --diff-filter=D --name-only", {
    cwd: extractGitRootDirFromArgs(args),
    shell: true,
  });
  return stdout.split("\n").filter(line => line.length > 0);
}

async function stageFile(args: any, file: string) {
  await command(`git add ${file}`, { cwd: extractGitRootDirFromArgs(args), shell: true });
}

const supportedExtensions = getSupportInfo().languages.reduce<string[]>(
  (acc, lang) => acc.concat(lang.extensions || []),
  []
);

function isSupportedExtension(file: string) {
  return supportedExtensions.includes(extname(file));
}

async function preCommitHook(args: any, config: any) {
  const files = await getStagedFiles(args);
  const unstaged = await getUnstagedFiles(args);
  const deleted = await getDeletedFiles(args);
  const rootDir = extractGitRootDirFromArgs(args);

  const isFullyStaged = (file: string) => !unstaged.includes(file);

  files
    .filter(file => !deleted.includes(file))
    .forEach(async file => {
      if (!isSupportedExtension(file)) {
        return;
      }

      const filepath = resolve(rootDir, file);
      const prettierConfig = resolveConfig.sync(filepath, {
        config: config.prettier.config ? config.prettier.config : SAMPLE_PRETTIER_CONFIG_FILE,
      });

      if (!prettierConfig) {
        return null;
      }

      const input = readFileSync(filepath, "utf8");
      const output = format(input, { ...prettierConfig, filepath });

      if (output !== input) {
        writeFileSync(filepath, output);

        if (isFullyStaged(file)) {
          await stageFile(args, file);
        }
      }
    });
}

const oghSampleHook = async (args: any, config: any) => {
  if (!config) {
    console.error("You should setting this package config in package.json");
    return;
  }

  if (extractHookFromArgs(args) === "pre-commit") {
    if (config.prettier) {
      await preCommitHook(args, config);
    }
  }
};

entrypoint("@yamadayuki/ogh-sample", { scriptPath: "lib/index.js", hooks: ["pre-commit"] })
  .registerPerformHook(oghSampleHook)
  .parse(process.argv);

import { entrypoint, extractHookFromArgs, extractCwdFromArgs } from "@yamadayuki/ogh-core";
import { resolve } from "path";
import { resolveConfig, format } from "prettier";
import { shellSync, sync } from "execa";
import { readFileSync, writeFileSync } from "fs";

const SAMPLE_PRETTIER_CONFIG_FILE = resolve(__dirname, "..", ".prettierrc");

function getStagedFiles(args: any) {
  const { stdout } = shellSync("git diff --cached --name-only", { cwd: extractCwdFromArgs(args) });
  return stdout.split("\n").filter(line => line.length > 0);
}

function getUnstagedFiles(args: any) {
  const { stdout } = shellSync("git diff --name-only", { cwd: extractCwdFromArgs(args) });
  return stdout.split("\n").filter(line => line.length > 0);
}

function stageFile(args: any, file: string) {
  shellSync(`git add ${file}`, { cwd: extractCwdFromArgs(args) });
}

function preCommitHook(args: any, config: any) {
  const files = getStagedFiles(args);
  const unstaged = getUnstagedFiles(args);
  const rootDir = extractCwdFromArgs(args);

  const isFullyStaged = (file: string) => !unstaged.includes(file);

  files.forEach(file => {
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
        stageFile(args, file);
      }
    }
  });
}

const oghSampleHook = (args: any, config: any) => {
  if (!config) {
    console.error("You should setting this package config in package.json");
    return;
  }

  if (extractHookFromArgs(args) === "pre-commit") {
    if (config.prettier) {
      preCommitHook(args, config);
    }
  }
};

entrypoint("@yamadayuki/ogh-sample", "lib/index.js")
  .registerPerformHook(oghSampleHook)
  .parse(process.argv);

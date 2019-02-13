import { entrypoint, extractHookFromArgs, extractCwdFromArgs } from "@yamadayuki/ogh-core";
import * as execa from "execa";
import { resolve } from "path";

function preCommitHook(args: any, config: any) {
  let prettierExecString = "prettier --write";

  if (!config.prettier.config) {
    prettierExecString = prettierExecString.concat(" ", "--config", " ", resolve(__dirname, "..", ".prettierrc"));
  }

  if (config.prettier.pattern) {
    prettierExecString = prettierExecString.concat(" ", config.prettier.pattern);
  }

  console.log(args);

  execa.shellSync(prettierExecString, {
    cwd: extractCwdFromArgs(args),
    stdio: "inherit",
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

import { entrypoint, extractHookFromArgs } from "@yamadayuki/ogh-core";
import * as execa from "execa";
import { resolve } from "path";

const oghSampleHook = (args: any, config: any) => {
  if (!config) {
    console.error("You should setting this package config in package.json");
    return;
  }

  if (extractHookFromArgs(args) === "pre-commit") {
    console.log(config);

    if (config.prettier) {
      let prettierExecString = "prettier --write";

      if (config.prettier.config) {
        prettierExecString = prettierExecString.concat(
          " ",
          "--config",
          " ",
          config.prettier.config
        );
      } else {
        prettierExecString = prettierExecString.concat(
          " ",
          "--config",
          " ",
          resolve(__dirname, "..", ".prettierrc")
        );
      }

      if (config.prettier.pattern) {
        prettierExecString = prettierExecString.concat(
          " ",
          config.prettier.pattern
        );
      }

      console.log(prettierExecString);

      execa.shellSync(prettierExecString, {
        cwd: process.cwd(),
        stdio: "inherit",
      });
    }
  }
};

entrypoint("@yamadayuki/ogh-sample", "lib/index.js")
  .registerPerformHook(oghSampleHook)
  .parse(process.argv);

import { entrypoint, extractHookFromArgs } from "@yamadayuki/ogh-core";

const oghSampleHook = (args: any, config: any) => {
  if (extractHookFromArgs(args) === "pre-commit") {
    console.log("pre commit hook!");
    console.log({ args, config });
  }
};

entrypoint("@yamadayuki/ogh-sample", "lib/index.js")
  .registerPerformHook(oghSampleHook)
  .parse(process.argv);

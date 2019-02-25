/* eslint-disable indent */

import * as childProcess from "child_process";
import * as mock from "mock-fs";
import { getGitHooksDirectory } from "../git";

// Mocks
jest.mock("child_process");

afterEach(() => {
  mock.restore();
  jest.clearAllMocks();
});

const mockGit = () => {
  mock({
    "/.git": {},
    "/foo.js": "foo()",
    "/bar.md": "# foo",
    "/baz.js": "baz()",
  });

  (childProcess as jest.Mocked<typeof childProcess>).execSync.mockImplementation((commandStr, _options) => {
    const [command, ...args] = commandStr.split(" ");

    if (command !== "git") {
      throw new Error(`unexpected command: ${command}`);
    }

    switch (args[0]) {
      case "rev-parse": {
        if (args[1] === "--git-dir") {
          return Buffer.from("/.git");
        } else if (args[1] === "--git-path") {
          return Buffer.from(`/.git/${args[2]}`);
        }
        throw new Error(`unexpected subcommand first arg: ${args[1]}`);
      }
      case "diff": {
        return Buffer.from(args[1] === "--cached" ? "./foo.js\n" : "./bar.md\n./baz.js");
      }
      default: {
        throw new Error(`unexpected subcommand: ${args[0]}`);
      }
    }
  });
};

// Tests
describe("git module", () => {
  describe("getGitHooksDirectory", () => {
    it("calls `git rev-parse --git-path hooks`", () => {
      mockGit();
      getGitHooksDirectory();

      expect(childProcess.execSync).toHaveBeenCalledWith("git rev-parse --git-path hooks");
    });

    it("returns the full path instead of relative path and concatenaited with argument", () => {
      mockGit();
      expect(getGitHooksDirectory()).toBe("/.git/hooks");
    });
  });
});

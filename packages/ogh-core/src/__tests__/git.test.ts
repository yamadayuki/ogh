import * as child_process from "child_process";
import * as mock from "mock-fs";
import { getDotGitDirectory, getGitHooksDirectory, getRootDirectory, getStagedFiles, getUnstagedFiles } from "../git";

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

  (child_process as jest.Mocked<typeof child_process>).execSync.mockImplementation((commandStr, options) => {
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
        } else {
          throw new Error(`unexpected subcommand first arg: ${args[1]}`);
        }
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
  describe("getDotGitDirectory", () => {
    it("calls `git rev-parse --git-dir`", () => {
      mockGit();
      getDotGitDirectory();

      expect(child_process.execSync).toHaveBeenCalledWith("git rev-parse --git-dir");
    });

    it("returns the full path instead of relative path", () => {
      mockGit();
      expect(getDotGitDirectory()).toBe("/.git");
    });
  });

  describe("getGitHooksDirectory", () => {
    it("calls `git rev-parse --git-path hooks`", () => {
      mockGit();
      getGitHooksDirectory();

      expect(child_process.execSync).toHaveBeenCalledWith("git rev-parse --git-path hooks");
    });

    it("returns the full path instead of relative path and concatenaited with argument", () => {
      mockGit();
      expect(getGitHooksDirectory()).toBe("/.git/hooks");
    });
  });

  describe("getRootDirectory", () => {
    it("calls execSync once", () => {
      mockGit();
      getRootDirectory();

      expect(child_process.execSync).toHaveBeenCalledTimes(1);
    });

    it("returns the root directory", () => {
      mockGit();
      expect(getRootDirectory()).toBe("/");
    });
  });

  describe("getStagedFiles", () => {
    it("calls `git diff --cached --name-only`", () => {
      mockGit();
      getStagedFiles();

      expect(child_process.execSync).toHaveBeenLastCalledWith("git diff --cached --name-only", { cwd: "/" });
    });

    it("returns only staged files", () => {
      mockGit();
      const staged = getStagedFiles();
      expect(staged).toHaveLength(1);
      expect(staged).toEqual(["./foo.js"]);
    });
  });

  describe("getUnstagedFiles", () => {
    it("calls `git diff --name-only`", () => {
      mockGit();
      getUnstagedFiles();

      expect(child_process.execSync).toHaveBeenLastCalledWith("git diff --name-only", { cwd: "/" });
    });

    it("returns only unstaged files", () => {
      mockGit();
      const unstaged = getUnstagedFiles();
      expect(unstaged).toHaveLength(2);
      expect(unstaged).toEqual(["./bar.md", "./baz.js"]);
    });
  });
});

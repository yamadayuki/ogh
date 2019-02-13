# ogh-cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ogh-cli.svg)](https://npmjs.org/package/ogh-cli)
[![Downloads/week](https://img.shields.io/npm/dw/ogh-cli.svg)](https://npmjs.org/package/ogh-cli)
[![License](https://img.shields.io/npm/l/ogh-cli.svg)](https://github.com/yamadayuki/ogh-cli/blob/master/package.json)

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)
  <!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g ogh-cli
$ ogh-cli COMMAND
running command...
$ ogh-cli (-v|--version|version)
ogh-cli/0.0.0 darwin-x64 node-v10.14.1
$ ogh-cli --help [COMMAND]
USAGE
  $ ogh-cli COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`ogh-cli hello [FILE]`](#ogh-cli-hello-file)
- [`ogh-cli help [COMMAND]`](#ogh-cli-help-command)

## `ogh-cli hello [FILE]`

describe the command here

```
USAGE
  $ ogh-cli hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ ogh-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/yamadayuki/ogh-cli/blob/v0.0.0/src/commands/hello.ts)_

## `ogh-cli help [COMMAND]`

display help for ogh-cli

```
USAGE
  $ ogh-cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.6/src/commands/help.ts)_

<!-- commandsstop -->

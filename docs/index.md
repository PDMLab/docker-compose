---
layout: default
title: README
nav_order: 99
---

<img src="https://img.shields.io/circleci/project/github/PDMLab/docker-compose.svg" /> <a href="https://join.slack.com/t/pdmlab-oss/shared_invite/enQtNjEyMjQ0MDY3NTczLTg1ZDc0YjQxMGE3MTcyYTdkODU1YjFmMTBiODE2ZTZiNDFkNjc1MWE4OTE4NWY0Y2YyMWYzYmNhZGY0NDAyYWY"><img src="https://img.shields.io/badge/Slack-join-green.svg?logo=slack" /></a>

# Manage Docker-Compose via Node.js

`docker-compose` is a small library that allows you to run [docker-compose](https://docs.docker.com/compose/)(which is still required) via Node.js. This is useful to bootstrap test environments. You might also generate your `docker-compose.yml` files using [composefile](https://www.npmjs.com/package/composefile).

## Existing user? We need your help
First of all: thanks for using the `docker-compose` module.
As described in [#44][i44], we're planning to provide more guidance for CI/CD when using the `docker-compose` module and it would be great if you could support us here. More details in [#44][i44].

[i44]: https://github.com/PDMLab/docker-compose/issues/44

## Installation

```
npm install --save-dev docker-compose
```

## Usage

`docker-compose` current supports these commands:

* `upAll(options)` - Builds, (re)creates, starts, and attaches to containers for all services - always uses the `-d` flag due to non interactive mode
* `upMany(services, options)` - Builds, (re)creates, starts, and attaches to containers for the services specified in `services` - always uses the `-d` flag due to non interactive mode
* `upOne(service, options)` - Builds, (re)creates, starts, and attaches to containers for a service specified in `service` - always uses the `-d` flag due to non interactive mode
* `down(options)` - Stops containers and removes containers, networks, volumes, and images created by `up`
* `kill(options)` - Force stop service containers
* `stop(options)` - Stop running containers without removing them
* `rm(options)` - Remove stopped service containers - always uses the `-f` flag due to non interactive mode
* `exec(container, command, options)` - Exec `command` inside `container`, uses `-T` to properly handle stdin & stdout
* `logs(container, command, options)` - Show logs of service. Use `options.follow` `true|false` to turn on `--follow` flag.
* `run(service, command, options)` - Run a one-off `command` on a service, uses `-T` to properly handle stdin & stdout
* `buildAll(options)` - Build or rebuild services
* `buildMany(services, options)` - Build or rebuild services
* `buildOne(service, options)` - Build or rebuild service
* `restartAll(options)` - Restart all services
* `restartMany(services, options)` - Restart services
* `restartOne(service, options)` - Restart service
* `ps(options)` - Lists containers information
* `config(options)` - Validates configuration files and returns configuration yaml
* `configServices(options)` - Returns list of services defined in configuration files
* `configVolumes(options)` - Returns list of volumes defined in configuration files

All commands return a `Promise({object})` with stdout and stderr strings and an exit code:
```javascript
{
  out: 'stdout contents',
  err: 'stderr contents',
  exitCode: 0, // !== 0 in case of an error
}
```

### Example

To start service containers based on the `docker-compose.yml` file in your current directory, just call `compose.up` like this:

```javascript
compose.upAll({ cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done')},
    err => { console.log('something went wrong:', err.message)}
  );
```

To execute command inside a running container
```javascript
compose.exec('node', 'npm install', { cwd: path.join(__dirname) })
```

### Options

`docker-compose` accepts these params:

* `cwd {string}`: mandatory folder path to the `docker-compose.yml`
* `config {(string|string[])}`: custom and/or multiple yml files can be specified (relative to `cwd`)
* `[log] {boolean}`:  optional setting to enable console logging (output of `docker-compose` `stdout`/`stderr` output)
* `[composeOptions] string[]|Array<string|string[]`: pass optional compose options like `"--verbose"` or `[["--verbose"], ["--log-level", "DEBUG"]]` or `["--verbose", ["--loglevel", "DEBUG"]]` for *all* commands.
* `[commandOptions] string[]|Array<string|string[]`: pass optional command options like `"--build"` or `[["--build"], ["--timeout", "5"]]` or `["--build", ["--timeout", "5"]]` for the `up` command. Viable `commandOptions` depend on the command (`up`, `down` etc.) itself

## Running the tests

While `docker-compose` runs on Node.js 6+, running the tests requires you to use Node.js 8 as they make use of `async/await`.

```
npm test
```

## Want to help?

This project is just getting off the ground and could use some help with cleaning things up and refactoring.

If you want to contribute - we'd love it! Just open an issue to work against so you get full credit for your fork. You can open the issue first so we can discuss and you can work your fork as we go along.

If you see a bug, please be so kind as to show how it's failing, and we'll do our best to get it fixed quickly.

Before sending a PR, please [create an issue](https://github.com/PDMLab/docker-compose/issues/new) to introduce your idea and have a reference for your PR.

Also please add tests and make sure to run `npm run eslint`.

### Slack

If you want to discuss an `docker-compose` issue or PR in more detail, feel free to [join our Slack workspace](https://join.slack.com/t/pdmlab-oss/shared_invite/enQtNjEyMjQ0MDY3NTczLTg1ZDc0YjQxMGE3MTcyYTdkODU1YjFmMTBiODE2ZTZiNDFkNjc1MWE4OTE4NWY0Y2YyMWYzYmNhZGY0NDAyYWY). 

## License

MIT License

Copyright (c) 2017 - 2019 PDMLab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


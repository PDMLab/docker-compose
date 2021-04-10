---
title: Manage Docker-Compose via Node.js
lang: en-US
home: false
---
# Manage Docker-Compose via Node.js

`docker-compose` is a small library that allows you to run [docker-compose](https://docs.docker.com/compose/) (which is still required) via Node.js. This is useful to bootstrap test environments.

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
* `stopOne(service, options)` - Stops one container without removing it
* `rm(options)` - Remove stopped service containers - always uses the `-f` flag due to non interactive mode
* `exec(container, command, options)` - Exec `command` inside `container`, uses `-T` to properly handle stdin & stdout
* `logs(services, options)` - Show logs of service(s). Use `options.follow` `true|false` to turn on `--follow` flag.
* `run(service, command, options)` - Run a one-off `command` on a service, uses `-T` to properly handle stdin & stdout
* `buildAll(options)` - Build or rebuild services
* `buildMany(services, options)` - Build or rebuild services
* `buildOne(service, options)` - Build or rebuild service
* `pullMany(services, options)` - Pull service images specified
* `pullOne(service, options)` - Pull a service image
* `pullAll(options)` - Pull all service images
* `restartAll(options)` - Restart all services
* `restartMany(services, options)` - Restart services
* `restartOne(service, options)` - Restart service
* `ps(options)` - Lists containers information
* `config(options)` - Validates configuration files and returns configuration yaml
* `configServices(options)` - Returns list of services defined in configuration files
* `configVolumes(options)` - Returns list of volumes defined in configuration files
* `port(options)` - Returns the public port of the given service and internal port. 

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
* `configAsString {string}`: configuration can be provided as is, instead of relying on a file. In case `configAsString` is provided `config` will be ignored.
* `[log] {boolean}`:  optional setting to enable console logging (output of `docker-compose` `stdout`/`stderr` output)
* `[composeOptions] string[]|Array<string|string[]`: pass optional compose options like `"--verbose"` or `[["--verbose"], ["--log-level", "DEBUG"]]` or `["--verbose", ["--loglevel", "DEBUG"]]` for *all* commands.
* `[commandOptions] string[]|Array<string|string[]`: pass optional command options like `"--build"` or `[["--build"], ["--timeout", "5"]]` or `["--build", ["--timeout", "5"]]` for the `up` command. Viable `commandOptions` depend on the command (`up`, `down` etc.) itself

## Running the tests

While `docker-compose` runs on Node.js 6+, running the tests requires you to use Node.js 8 as they make use of `async/await`.

```
yarn test
```

## Want to help?

This project is just getting off the ground and could use some help with cleaning things up and refactoring.

If you want to contribute - we'd love it! Just open an issue to work against so you get full credit for your fork. You can open the issue first so we can discuss and you can work your fork as we go along.

If you see a bug, please be so kind as to show how it's failing, and we'll do our best to get it fixed quickly.

Before sending a PR, please [create an issue](https://github.com/PDMLab/docker-compose/issues/new) to introduce your idea and have a reference for your PR.

We're using [conventional commits](https://www.conventionalcommits.org), so please use it for your commits as well.

Also please add tests and make sure to run `yarn lint`.

### Slack

If you want to discuss an `docker-compose` issue or PR in more detail, feel free to [join our Slack workspace](https://join.slack.com/t/pdmlab-oss/shared_invite/enQtNjEyMjQ0MDY3NTczLTg1ZDc0YjQxMGE3MTcyYTdkODU1YjFmMTBiODE2ZTZiNDFkNjc1MWE4OTE4NWY0Y2YyMWYzYmNhZGY0NDAyYWY).

## License

MIT License

Copyright (c) 2017 - 2021 PDMLab

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


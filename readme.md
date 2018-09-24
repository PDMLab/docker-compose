# Manage Docker-Compose via Node.js

`docker-compose` is a small library that allows you to run [docker-compose](https://docs.docker.com/compose/)(which is still required) via Node.js. This is useful to bootstrap test environments. You might also generate your `docker-compose.yml` files using [composefile](https://www.npmjs.com/package/composefile).

## Installation

```
npm install --save-dev docker-compose
```

## Usage

`docker-compose` current supports these commands:

* `upAll(options)` - Create and start containers - always uses the `-d` flag due to non interactive mode
* `upMany(services, options)` - Create and start containers specified in `services` - always uses the `-d` flag due to non interactive mode
* `upOne(service, options)` - Create and start container specified in `service` - always uses the `-d` flag due to non interactive mode
* `down(options)` - Stop and remove containers, networks, images, and volumes
* `kill(options)` - Kill containers
* `stop(options)` - Stop services
* `rm(options)` - Remove stopped containers - always uses the `-f` flag due to non interactive mode
* `exec(container, command, options)` - Exec `command` inside `container`, uses `-T` to properly handle stdin & stdout
* `run(container, command, options)` - Run `command` inside `container`, uses `-T` to properly handle stdin & stdout
* `buildAll(options)` - Build all images
* `buildMany(services, options)` - Build images of specified services
* `buildOne(service, options)` - Build image of specified service

All commands return a `Promise({object})` with an stdout and stderr strings
```javascript
{
  out: 'stdout contents' 
  err: 'stderr contents'
}
```

### Example

To start containers based on the `docker-compose.yml` file in your current directory, just call `compose.up` like this:

```javascript
compose.up({ cwd: path.join(__dirname), log: true })
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

## License

MIT License

Copyright (c) 2018 PDMLab

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


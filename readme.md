# Manage Docker-Compose via Node.js

`docker-compose` is a small library that allows you to run [docker-compose](https://docs.docker.com/compose/)(which is still required) via Node.js. This is useful to bootstrap test environments. You might also generate your `docker-compose.yml` files using [composefile](https://www.npmjs.com/package/composefile).

## Installation

```
npm install --save-dev docker-compose
```

## Usage

`docker-compose` current supports these commands:

* up - create and start containers - always uses the `-d` flag due to non interactive mode
* down - Stop and remove containers, networks, images, and volumes
* kill - Kill containers
* stop - Stop services
* rm - Remove stopped containers - always uses the `-f` flag due to non interactive mode

All commands return a Promise.

### Example

To start containers based on the `docker-compose.yml` file in your current directory, just call `compose.up` like this:

```javascript
compose.up({ cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done')}, 
    err => { console.log('something went wrong:', err.message)}
  );
```

### Options

`docker-compose` accepts these params:

* `cwd {string}`: mandatory folder path to the `docker-compose.yml` (you don't need to specify the name of the `docker-compose.yml` - and custom file names are not supported yet ([PR ahead](https://github.com/PDMLab/docker-compose/issues/1)? 😉))
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

Copyright (c) 2017 PDMLab

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


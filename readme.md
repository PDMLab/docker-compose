[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) 
[![Discord](https://img.shields.io/discord/1070453198000767076)](https://discord.gg/dKWyyv6M)
<img src="https://img.shields.io/github/actions/workflow/status/pdmlab/docker-compose/ci.yml?branch=master" /> 
<img src="https://img.shields.io/npm/dm/docker-compose.svg" />

# Manage Docker-Compose via Node.js

`docker-compose` is a small library that allows you to run [docker-compose](https://docs.docker.com/compose/)(which is still required) via Node.js. This is useful to bootstrap test environments.

## Installation

```bash
yarn add --dev docker-compose
```

## Documentation

The documentation can be found [here](https://pdmlab.github.io/docker-compose/).

## Example

To start service containers based on the `docker-compose.yml` file in your current directory, just call `compose.up` like this:

```javascript
compose.upAll({ cwd: path.join(__dirname), log: true }).then(
  () => {
    console.log('done')
  },
  (err) => {
    console.log('something went wrong:', err.message)
  }
)
```

To execute command inside a running container

```javascript
compose.exec('node', 'npm install', { cwd: path.join(__dirname) })
```

## Running the tests

While `docker-compose` runs on Node.js 6+, running the tests requires you to use Node.js 8+ as they make use of `async/await`.

```bash
yarn test
```

## Want to help?

This project is just getting off the ground and could use some help with cleaning things up and refactoring.

If you want to contribute - we'd love it! Just open an issue to work against so you get full credit for your fork. You can open the issue first so we can discuss and you can work your fork as we go along.

If you see a bug, please be so kind as to show how it's failing, and we'll do our best to get it fixed quickly.

Before sending a PR, please [create an issue](https://github.com/PDMLab/docker-compose/issues/new) to introduce your idea and have a reference for your PR.

We're using [conventional commits](https://www.conventionalcommits.org), so please use it for your commits as well.

Also please add tests and make sure to run `yarn lint`.

### Discussions

If you want to discuss an `docker-compose` issue or PR in more detail, feel free to [start a discussion](https://github.com/PDMLab/docker-compose/discussions).

## License

MIT License

Copyright (c) 2017 - 2021 PDMLab

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# Getting started

`docker-compose` is a small library that allows you to run [docker-compose](https://docs.docker.com/compose/) (which is still required) using Node.js. This is useful to bootstrap test environments.

## Manage Docker-Compose using Node.js

## Installation

```bash
npm install --save-dev docker-compose
```

### Import for `docker-compose` (v1)

To import commands for the v1 version, please use this import statement:

```ts
import * as compose from 'docker-compose'
```

You can also import only the required commands:

```ts
import { run, upAll } from 'docker-compose'
```

### Import for `docker compose` (v2)

To import commands for the v2 version, please use this import statement:

```ts
import { v2 as compose } from 'docker-compose'
```

You can also import only the required commands:

```ts
import { run, upAll } from 'docker-compose/dist/v2'
```

### Known issues with v2 support

* During testing we noticed that `docker compose` seems to send it's exit code also commands don't seem to have finished. This doesn't occur for all commands, but for example with `stop` or `down`. We had the option to wait for stopped / removed containers using third party libraries but this would make bootstrapping `docker-compose` much more complicated for the users. So we decided to use a `setTimeout(500)` workaround. We're aware this is not perfect but it seems to be the most appropriate solution for now. Details can be found in the [v2 PR discussion](https://github.com/PDMLab/docker-compose/pull/228#issuecomment-1422895821) (we're happy to get help here).

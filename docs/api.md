---
outline: deep
---

# API Docs

This page demonstrates the usage of `docker-compose` for Node.js.

## Usage

`docker-compose` current supports these commands:

* `buildAll(options)` - Build or rebuild services
* `buildMany(services, options)` - Build or rebuild services
* `buildOne(service, options)` - Build or rebuild service
* `config(options)` - Validates configuration files and returns configuration yaml
* `configServices(options)` - Returns list of services defined in configuration files
* `configVolumes(options)` - Returns list of volumes defined in configuration files
* `createAll(options)` - Create or recreate services
* `createMany(services, options)` - Create or recreate services
* `createOne(service, options)` - Create or recreate service
* `down(options)` - Stops containers and removes containers, networks, volumes, and images created by `up`
* `exec(container, command, options)` - Exec `command` inside `container` - uses `-T` to properly handle stdin & stdout
* `kill(options)` - Force stop service containers
* `images(options)` - Show all created images
* `logs(services, options)` - Show logs of service(s) - use `options.follow` `true|false` to turn on `--follow` flag
* `pauseOne(service, options)` - Pause the specified service
* `port(service, containerPort, options)` - Returns the public port of the given service and internal port.
* `ps(options)` - Lists containers information
* `pullAll(options)` - Pull all service images
* `pullMany(services, options)` - Pull service images specified
* `pullOne(service, options)` - Pull a service image
* `restartAll(options)` - Restart all services
* `restartMany(services, options)` - Restart services
* `restartOne(service, options)` - Restart service
* `rm(options, services)` - Remove stopped service containers - always uses the `-f` flag due to non interactive mode - `services` can optionally be used to select the containers to remove
* `run(service, command, options)` - Run a one-off `command` on a service - uses `-T` to properly handle stdin & stdout
* `stop(options)` - Stop running containers without removing them
* `stopOne(service, options)` - Stops one container without removing it
* `stopMany(options,services)` - Stops containers without removing them
* `unpauseOne(service, options)` - Resume the specified service
* `upAll(options)` - Builds, (re)creates, starts, and attaches to containers for all services - always uses the `-d` flag due to non interactive mode
* `upMany(services, options)` - Builds, (re)creates, starts, and attaches to containers for the services specified in `services` - always uses the `-d` flag due to non interactive mode
* `upOne(service, options)` - Builds, (re)creates, starts, and attaches to containers for a service specified in `service` - always uses the `-d` flag due to non interactive mode
* `version(options)` - Show `docker-compose` version strings

All commands return a `Promise({object})` with stdout and stderr strings and an exit code:

```javascript
{
  out: 'stdout contents',
  err: 'stderr contents',
  exitCode: 0, // !== 0 in case of an error
}
```

Although the return type is a `Promise`, it is still possible to get the process progres before the `Promise` resolves, by passing a callback function to the optional `callback` parameter.

### Example

To start service containers based on the `docker-compose.yml` file in your current directory, just call `compose.up` like this:

```javascript
compose.upAll({ cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done')},
    err => { console.log('something went wrong:', err.message)}
  );
```

To get process progress

```typescript
compose.upAll({
   cwd: path.join(__dirname),
   callback: (chunk: Buffer) => {
     console.log('job in progres: ', chunk.toString())
      }
   })
  .then(
    () => { console.log('job done')},
    err => { console.log('something went wrong:', err.message)}
  );
```

To execute command inside a running container:

```javascript
compose.exec('node', 'npm install', { cwd: path.join(__dirname) })
```

### Options

`docker-compose` accepts these params:

* `cwd {string}`: mandatory folder path to the `docker-compose.yml`
* `executablePath {string}`: optional path to docker-compose executable in case it's not located in $PATH `/path/to/docker-compose`
* `config {(string|string[])}`: custom and/or multiple yml files can be specified (relative to `cwd`)
* `configAsString {string}`: configuration can be provided as is, instead of relying on a file. In case `configAsString` is provided `config` will be ignored.
* `[log] {boolean}`:  optional setting to enable console logging (output of `docker-compose` `stdout`/`stderr` output)
* `[composeOptions] string[]|Array<string|string[]`: pass optional compose options like `"--verbose"` or `[["--verbose"], ["--log-level", "DEBUG"]]` or `["--verbose", ["--loglevel", "DEBUG"]]` for *all* commands.
* `[callback] (chunk: Buffer, sourceStream?: 'stdout' | 'stderr') => void`: optional callback function, that provides infromation about the process while it is still runing.  
* `[commandOptions] string[]|Array<string|string[]`: pass optional command options like `"--build"` or `[["--build"], ["--timeout", "5"]]` or `["--build", ["--timeout", "5"]]` for the `up` command. Viable `commandOptions` depend on the command (`up`, `down` etc.) itself

### `ps`

`ps(options)` - Lists containers for a Compose project, with current status and exposed ports.

`ps` returns a `Promise` of `TypedDockerComposeResult<DockerComposePsResult>`.

A basic example looks like this:

```javascript
const result = await compose.ps({ cwd: path.join(__dirname) })
result.data.services.forEach((service) => {
  console.log(service.name, service.command, service.state, service.ports)
  // state is e.g. 'Up 2 hours'
})
```

The resolved `result` might look like this (for v2):

```javascript
{
    exitCode: 0,
    err: '',
    out: 'NAME                 IMAGE                 COMMAND                                          SERVICE   CREATED        STATUS                  PORTS\n' +
    `compose_test_proxy   nginx:1.19.9-alpine   "/docker-entrypoint.sh nginx -g 'daemon off;'"   proxy     1 second ago   Up Less than a second   80/tcp\n` +
    `compose_test_web     nginx:1.16.0          "nginx -g 'daemon off;'"                         web       1 second ago   Up Less than a second   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp\n`,
    data: {
        services: [
            {
                name: 'compose_test_proxy',
                command: `"/docker-entrypoint.sh nginx -g 'daemon off;'"`,
                state: 'Up Less than a second',
                ports: [ { exposed: { port: 80, protocol: 'tcp' } } ]
            },
            {
                name: 'compose_test_web',
                command: `"nginx -g 'daemon off;'"`,
                state: 'Up Less than a second',
                ports: [
                    {
                        exposed: { port: 80, protocol: 'tcp' },
                        mapped: { port: 80, address: '0.0.0.0' }
                    },
                    {
                        exposed: { port: 443, protocol: 'tcp' },
                        mapped: { port: 443, address: '0.0.0.0' }
                    }
                ]
            }
        ]
    }
}
```

**Only v2**: If you need a defined state, you can use the `--format json` command option.
This will return one of the defined states `paused | restarting | removing | running | dead | created | exited` as the state of a service. 

```javascript
const result = await compose.ps({ cwd: path.join(__dirname), commandOptions: [["--format", "json"]] })
result.data.services.forEach((service) => {
  console.log(service.name, service.command, service.state, service.ports)
  // state is one of the defined states: paused | restarting | removing | running | dead | created | exited
})
```

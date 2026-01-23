---
outline: deep
category: Reference
---

# API Docs

This page demonstrates the usage of `docker-compose` for Node.js.

## Commands

| Command | Description |
|---------|-------------|
| [up](/commands/up) | Builds, (re)creates, starts, and attaches to containers |
| [down](/commands/down) | Stops and removes containers, networks, volumes, and images |
| [stop](/commands/stop) | Stops running containers without removing them |
| [restart](/commands/restart) | Restart services |
| [build](/commands/build) | Build or rebuild services |
| [create](/commands/create) | Create containers without starting them |
| [pull](/commands/pull) | Pull service images |
| [push](/commands/push) | Push service images |
| [config](/commands/config) | Validate and view configuration |
| [ps](/commands/ps) | List containers |
| [images](/commands/images) | List images |
| [logs](/commands/logs) | View container logs |
| [exec](/commands/exec) | Execute a command in a running container |
| [run](/commands/run) | Run a one-off command |
| [rm](/commands/rm) | Remove stopped containers |
| [kill](/commands/kill) | Force stop containers |
| [pause](/commands/pause) | Pause and unpause services |
| [port](/commands/port) | Print public port for a port binding |
| [version](/commands/version) | Show version information |
| [stats](/commands/stats) | Display container resource usage |

## Return Type

All commands return a `Promise({object})` with stdout and stderr strings and an exit code:

```typescript
{
  out: 'stdout contents',
  err: 'stderr contents',
  exitCode: 0, // !== 0 in case of an error
}
```

## Progress Callback

Although the return type is a `Promise`, it is still possible to get the process progress before the `Promise` resolves, by passing a callback function to the optional `callback` parameter.

```typescript
compose.upAll({
  cwd: path.join(__dirname),
  callback: (chunk: Buffer) => {
    console.log('job in progress: ', chunk.toString())
  }
}).then(
  () => { console.log('job done') },
  err => { console.log('something went wrong:', err.message) }
)
```

## Options

`docker-compose` accepts these params:

| Option | Type | Description |
|--------|------|-------------|
| `cwd` | `string` | **Required.** Folder path to the `docker-compose.yml` |
| `executablePath` | `string` | Path to docker-compose executable if not in `$PATH` |
| `config` | `string \| string[]` | Custom yml file(s), relative to `cwd` |
| `configAsString` | `string` | Configuration as string (ignores `config` if set) |
| `log` | `boolean` | Enable console logging |
| `composeOptions` | `string[] \| Array<string \| string[]>` | Options for all commands (e.g., `--verbose`) |
| `commandOptions` | `string[] \| Array<string \| string[]>` | Options for specific command |
| `callback` | `(chunk: Buffer, sourceStream?: 'stdout' \| 'stderr') => void` | Progress callback |

### Example with options

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.upAll({
  cwd: path.join(__dirname),
  config: 'docker-compose.prod.yml',
  log: true,
  composeOptions: ['--verbose'],
  commandOptions: ['--build', ['--timeout', '30']]
})
```

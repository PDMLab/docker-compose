# rm

Remove stopped service containers.

## Usage

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

// Remove all stopped containers
const result = await compose.rm({ cwd: path.join(__dirname) })

// Remove specific stopped containers
const result = await compose.rm({ cwd: path.join(__dirname) }, ['service1', 'service2'])
```

::: info
The `rm` command always uses the `-f` flag due to non-interactive mode.
:::

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `IDockerComposeOptions` | Configuration options |
| `services` | `string[]` | Optional list of services to remove |

## Examples

### Remove all stopped containers

```typescript
await compose.rm({ cwd: path.join(__dirname), log: true })
```

### Remove specific containers

```typescript
await compose.rm({ cwd: path.join(__dirname) }, ['web', 'db'])
```

## Options

In addition to the [common options](/api#options), `rm` supports these command options:

- `--stop` / `-s` - Stop the containers before removing
- `--volumes` / `-v` - Remove any anonymous volumes attached to containers

```typescript
compose.rm({
  cwd: path.join(__dirname),
  commandOptions: ['--stop', '--volumes']
})
```

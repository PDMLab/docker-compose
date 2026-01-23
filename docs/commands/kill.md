---
category: Commands
---

# kill

Force stop service containers.

## Usage

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

const result = await compose.kill({ cwd: path.join(__dirname) })
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `IDockerComposeOptions` | Configuration options |

## Example

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.kill({ cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('Containers killed') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## Options

In addition to the [common options](/api#options), `kill` supports these command options:

- `--signal` / `-s` - Signal to send to the container (default: SIGKILL)

```typescript
compose.kill({
  cwd: path.join(__dirname),
  commandOptions: [['--signal', 'SIGTERM']]
})
```

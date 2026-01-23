# stats

Display a live stream of container resource usage statistics.

## Usage

```typescript
import * as compose from 'docker-compose'

const result = await compose.stats('service1')
console.log(result.out)
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `service` | `string` | The service name to get stats for |

## Return Type

`stats` returns a `Promise` of `TypedDockerComposeResult<DockerComposeStatsResult>`.

```typescript
interface DockerComposeStatsResult {
  out: string
}
```

## Example

```typescript
import * as compose from 'docker-compose'

const result = await compose.stats('web')

if (result.exitCode === 0) {
  console.log(result.out)
  // Output includes: CPU %, MEM USAGE / LIMIT, MEM %, NET I/O, BLOCK I/O, PIDS
}
```

::: info
The `stats` command internally uses `--no-stream` to return a single snapshot instead of a live stream.
:::

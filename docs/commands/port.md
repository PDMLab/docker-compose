---
category: Commands
---

# port

Print the public port for a port binding.

## Usage

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

const result = await compose.port('web', 80, { cwd: path.join(__dirname) })
console.log(result.data.address, result.data.port)
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `service` | `string` | The service name |
| `containerPort` | `string \| number` | The container port to look up |
| `options` | `IDockerComposeOptions` | Configuration options |

## Return Type

`port` returns a `Promise` of `TypedDockerComposeResult<DockerComposePortResult>`.

```typescript
interface DockerComposePortResult {
  address: string
  port: number
}
```

## Example Result

```typescript
{
  exitCode: 0,
  err: '',
  out: '0.0.0.0:8080\n',
  data: {
    address: '0.0.0.0',
    port: 8080
  }
}
```

## Example

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

const result = await compose.port('web', 80, { cwd: path.join(__dirname) })

if (result.exitCode === 0) {
  console.log(`Service is available at ${result.data.address}:${result.data.port}`)
}
```

## Options

In addition to the [common options](/api#options), `port` supports these command options:

- `--protocol` - tcp or udp (default: tcp)
- `--index` - Index of the container if there are multiple instances

```typescript
compose.port('web', 80, {
  cwd: path.join(__dirname),
  commandOptions: [['--protocol', 'udp']]
})
```

# images

List images used by the created containers.

## Usage

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

const result = await compose.images({ cwd: path.join(__dirname) })
result.data.services.forEach((service) => {
  console.log(service.container, service.repository, service.tag, service.platform, service.id)
})
```

## Return Type

`images` returns a `Promise` of `TypedDockerComposeResult<DockerComposeImListResult>`.

```typescript
interface DockerComposeImListResultService {
  container: string
  repository: string
  tag: string
  platform: string
  id: string // 12 byte id
}

interface DockerComposeImListResult {
  services: Array<DockerComposeImListResultService>
}
```

## Example Result

```typescript
{
  exitCode: 0,
  err: '',
  out: '...',
  data: {
    services: [
      {
        container: 'compose_test_hello',
        repository: 'hello-world',
        tag: 'latest',
        platform: 'linux/amd64',
        id: 'd2c94e258dcb'
      },
      {
        container: 'compose_test_web',
        repository: 'nginx',
        tag: '1.16.0',
        platform: 'linux/amd64',
        id: 'ae893c58d83f'
      }
    ]
  }
}
```

## Options

In addition to the [common options](/api#options), `images` supports these command options:

- `--quiet` / `-q` - Only display image IDs

::: info
The `images` command internally uses `--format json` for robust parsing across different docker compose versions.
:::

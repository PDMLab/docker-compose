---
category: Commands
---

# ps

Lists containers for a Compose project, with current status and exposed ports.

## Usage

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

const result = await compose.ps({ cwd: path.join(__dirname) })
result.data.services.forEach((service) => {
  console.log(service.name, service.command, service.state, service.ports)
})
```

## Return Type

`ps` returns a `Promise` of `TypedDockerComposeResult<DockerComposePsResult>`.

```typescript
interface DockerComposePsResultService {
  name: string
  command: string
  state: string
  ports: Array<{
    mapped?: { port: number; address: string }
    exposed: { port: number; protocol: string }
  }>
}

interface DockerComposePsResult {
  services: Array<DockerComposePsResultService>
}
```

## Example Result

```typescript
{
  exitCode: 0,
  err: '',
  out: 'NAME                 IMAGE                 ...',
  data: {
    services: [
      {
        name: 'compose_test_proxy',
        command: `"/docker-entrypoint.sh nginx -g 'daemon off;'"`,
        state: 'Up Less than a second',
        ports: [{ exposed: { port: 80, protocol: 'tcp' } }]
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

## Using JSON Format

If you need a defined state, you can use the `--format json` command option.
This will return one of the defined states `paused | restarting | removing | running | dead | created | exited` as the state of a service.

```typescript
const result = await compose.ps({
  cwd: path.join(__dirname),
  commandOptions: [['--format', 'json']]
})
result.data.services.forEach((service) => {
  console.log(service.name, service.command, service.state, service.ports)
  // state is one of: paused | restarting | removing | running | dead | created | exited
})
```

## Options

In addition to the [common options](/api#options), `ps` supports these command options:

- `--format` - Format the output (`table` or `json`)
- `--quiet` / `-q` - Only display container IDs
- `--services` - Display services
- `--all` / `-a` - Show all stopped containers

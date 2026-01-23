---
category: Commands
---

# config

Validate and view the Compose file configuration.

## config

Validates configuration files and returns configuration yaml.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

const result = await compose.config({ cwd: path.join(__dirname) })
console.log(result.out) // prints the merged configuration yaml
```

## configServices

Returns a list of services defined in the configuration files.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

const result = await compose.configServices({ cwd: path.join(__dirname) })
console.log(result.data.services) // ['service1', 'service2', ...]
```

The result includes:

```typescript
{
  exitCode: 0,
  err: '',
  out: 'service1\nservice2\n',
  data: {
    services: ['service1', 'service2']
  }
}
```

## configVolumes

Returns a list of volumes defined in the configuration files.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

const result = await compose.configVolumes({ cwd: path.join(__dirname) })
console.log(result.data.volumes) // ['volume1', 'volume2', ...]
```

The result includes:

```typescript
{
  exitCode: 0,
  err: '',
  out: 'volume1\nvolume2\n',
  data: {
    volumes: ['volume1', 'volume2']
  }
}
```

## Options

In addition to the [common options](/api#options), `config` commands support these command options:

- `--services` - Print the service names (used internally by `configServices`)
- `--volumes` - Print the volume names (used internally by `configVolumes`)
- `--resolve-image-digests` - Pin image tags to digests

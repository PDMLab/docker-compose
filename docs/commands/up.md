# up

Builds, (re)creates, starts, and attaches to containers for services.

::: info
All `up` commands always use the `-d` flag due to non-interactive mode.
:::

## upAll

Builds, (re)creates, starts, and attaches to containers for all services.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.upAll({ cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## upMany

Builds, (re)creates, starts, and attaches to containers for the specified services.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.upMany(['service1', 'service2'], { cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## upOne

Builds, (re)creates, starts, and attaches to containers for a single service.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.upOne('service1', { cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## Options

In addition to the [common options](/api#options), `up` commands support these command options:

- `--build` - Build images before starting containers
- `--force-recreate` - Recreate containers even if their configuration and image haven't changed
- `--no-deps` - Don't start linked services
- `--timeout` - Shutdown timeout in seconds (default: 10)

```typescript
compose.upAll({
  cwd: path.join(__dirname),
  commandOptions: [['--build'], ['--timeout', '30']]
})
```

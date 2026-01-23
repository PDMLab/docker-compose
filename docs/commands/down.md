# down

Stops containers and removes containers, networks, volumes, and images created by `up`.

## downAll / down

Stops and removes all containers, networks, volumes, and images.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.down({ cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

::: info
`down` is an alias for `downAll`.
:::

## downMany

Stops and removes specified services.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.downMany(['service1', 'service2'], { cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## downOne

Stops and removes a single service.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.downOne('service1', { cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## Options

In addition to the [common options](/api#options), `down` commands support these command options:

- `--volumes` / `-v` - Remove named volumes declared in the volumes section
- `--rmi` - Remove images (type: `all` or `local`)
- `--timeout` - Shutdown timeout in seconds (default: 10)

```typescript
compose.down({
  cwd: path.join(__dirname),
  commandOptions: [['--volumes'], ['--rmi', 'local']]
})
```

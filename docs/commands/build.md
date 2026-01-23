# build

Build or rebuild services.

## buildAll

Build or rebuild all services.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.buildAll({ cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## buildMany

Build or rebuild specified services.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.buildMany(['service1', 'service2'], { cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## buildOne

Build or rebuild a single service.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.buildOne('service1', { cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## Options

In addition to the [common options](/api#options), `build` commands support these command options:

- `--no-cache` - Do not use cache when building the image
- `--pull` - Always attempt to pull a newer version of the image
- `--parallel` - Build images in parallel

```typescript
compose.buildAll({
  cwd: path.join(__dirname),
  commandOptions: ['--no-cache', '--pull']
})
```

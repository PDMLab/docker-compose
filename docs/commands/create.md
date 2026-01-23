---
category: Commands
---

# create

Create containers for services without starting them.

## createAll

Create containers for all services.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.createAll({ cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## createMany

Create containers for specified services.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.createMany(['service1', 'service2'], { cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## createOne

Create a container for a single service.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.createOne('service1', { cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## Options

In addition to the [common options](/api#options), `create` commands support these command options:

- `--build` - Build images before creating containers
- `--force-recreate` - Recreate containers even if their configuration hasn't changed
- `--no-recreate` - Don't recreate containers if they exist

```typescript
compose.createAll({
  cwd: path.join(__dirname),
  commandOptions: ['--build']
})
```

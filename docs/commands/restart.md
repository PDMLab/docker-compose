# restart

Restart services.

## restartAll

Restart all services.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.restartAll({ cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## restartMany

Restart specified services.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.restartMany(['service1', 'service2'], { cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## restartOne

Restart a single service.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.restartOne('service1', { cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## Options

In addition to the [common options](/api#options), `restart` commands support these command options:

- `--timeout` / `-t` - Shutdown timeout in seconds (default: 10)

```typescript
compose.restartAll({
  cwd: path.join(__dirname),
  commandOptions: [['--timeout', '30']]
})
```

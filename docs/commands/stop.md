# stop

Stops running containers without removing them.

## stop

Stops all running containers.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.stop({ cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## stopMany

Stops specified containers.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.stopMany({ cwd: path.join(__dirname), log: true }, ['service1', 'service2'])
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## stopOne

Stops a single container.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.stopOne('service1', { cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## Options

In addition to the [common options](/api#options), `stop` commands support these command options:

- `--timeout` / `-t` - Shutdown timeout in seconds (default: 10)

```typescript
compose.stop({
  cwd: path.join(__dirname),
  commandOptions: [['--timeout', '30']]
})
```

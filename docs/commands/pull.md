# pull

Pull service images.

## pullAll

Pull all service images.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.pullAll({ cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## pullMany

Pull specified service images.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.pullMany(['service1', 'service2'], { cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## pullOne

Pull a single service image.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.pullOne('service1', { cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('done') },
    err => { console.log('something went wrong:', err.message) }
  )
```

## Options

In addition to the [common options](/api#options), `pull` commands support these command options:

- `--ignore-pull-failures` - Pull what it can and ignore images with pull failures
- `--quiet` / `-q` - Pull without printing progress information

```typescript
compose.pullAll({
  cwd: path.join(__dirname),
  commandOptions: ['--ignore-pull-failures']
})
```

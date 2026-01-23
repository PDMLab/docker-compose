# push

Push service images to their registries.

## Usage

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

const result = await compose.push({ cwd: path.join(__dirname) })
```

## Options

The `push` command accepts additional options:

```typescript
interface IDockerComposePushOptions extends IDockerComposeOptions {
  ignorePushFailures?: boolean
}
```

### Ignore push failures

Use `ignorePushFailures: true` to continue pushing other images if one fails:

```typescript
compose.push({
  cwd: path.join(__dirname),
  ignorePushFailures: true
})
```

## Example

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

compose.push({ cwd: path.join(__dirname), log: true })
  .then(
    () => { console.log('Images pushed') },
    err => { console.log('something went wrong:', err.message) }
  )
```

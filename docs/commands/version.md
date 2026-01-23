# version

Show the Docker Compose version information.

## Usage

```typescript
import * as compose from 'docker-compose'

const result = await compose.version()
console.log(result.data.version)
```

## Return Type

`version` returns a `Promise` of `TypedDockerComposeResult<DockerComposeVersionResult>`.

```typescript
interface DockerComposeVersionResult {
  version: string
}
```

## Example Result

```typescript
{
  exitCode: 0,
  err: '',
  out: 'Docker Compose version v2.20.0\n',
  data: {
    version: '2.20.0'
  }
}
```

## Example

```typescript
import * as compose from 'docker-compose'

const result = await compose.version()

if (result.exitCode === 0) {
  console.log(`Docker Compose version: ${result.data.version}`)
}
```

## Options

In addition to the [common options](/api#options), `version` supports these command options:

- `--short` - Shows only the version number

```typescript
compose.version({
  commandOptions: ['--short']
})
```

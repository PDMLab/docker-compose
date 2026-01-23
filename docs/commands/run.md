# run

Run a one-off command on a service.

## Usage

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

const result = await compose.run('service', 'npm test', {
  cwd: path.join(__dirname)
})
console.log(result.out)
```

::: info
The `run` command uses `-T` to properly handle stdin & stdout in non-interactive mode.
:::

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `service` | `string` | The service name to run the command on |
| `command` | `string` | The command to execute |
| `options` | `IDockerComposeOptions` | Optional configuration |

## Examples

### Run tests

```typescript
const result = await compose.run('node', 'npm test', {
  cwd: path.join(__dirname)
})
```

### Run a one-off script

```typescript
const result = await compose.run('app', 'node scripts/seed.js', {
  cwd: path.join(__dirname)
})
```

### Generate files

```typescript
const result = await compose.run('app', 'npx prisma generate', {
  cwd: path.join(__dirname)
})
```

## Options

In addition to the [common options](/api#options), `run` supports these command options:

- `--rm` - Remove container after run
- `--user` / `-u` - Run the command as this user
- `--workdir` / `-w` - Working directory inside the container
- `--env` / `-e` - Set environment variables
- `--no-deps` - Don't start linked services

```typescript
compose.run('node', 'npm test', {
  cwd: path.join(__dirname),
  commandOptions: ['--rm', '--no-deps']
})
```

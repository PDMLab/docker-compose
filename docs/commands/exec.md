---
category: Commands
---

# exec

Execute a command in a running container.

## Usage

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

const result = await compose.exec('container', 'npm install', {
  cwd: path.join(__dirname)
})
console.log(result.out)
```

::: info
The `exec` command uses `-T` to properly handle stdin & stdout in non-interactive mode.
:::

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `container` | `string` | The container name to execute the command in |
| `command` | `string` | The command to execute |
| `options` | `IDockerComposeOptions` | Optional configuration |

## Examples

### Run a shell command

```typescript
const result = await compose.exec('node', 'ls -la', {
  cwd: path.join(__dirname)
})
```

### Install dependencies

```typescript
const result = await compose.exec('node', 'npm install', {
  cwd: path.join(__dirname)
})
```

### Run database migrations

```typescript
const result = await compose.exec('app', 'npx prisma migrate deploy', {
  cwd: path.join(__dirname)
})
```

## Options

In addition to the [common options](/api#options), `exec` supports these command options:

- `--user` / `-u` - Run the command as this user
- `--workdir` / `-w` - Working directory inside the container
- `--env` / `-e` - Set environment variables

```typescript
compose.exec('node', 'whoami', {
  cwd: path.join(__dirname),
  commandOptions: [['--user', 'root']]
})
```

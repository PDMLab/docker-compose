---
category: Commands
---

# logs

View output from containers.

## Usage

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

// Get logs for a single service
const result = await compose.logs('service1', { cwd: path.join(__dirname) })
console.log(result.out)

// Get logs for multiple services
const result = await compose.logs(['service1', 'service2'], { cwd: path.join(__dirname) })
console.log(result.out)
```

## Options

The `logs` command accepts additional options:

```typescript
interface IDockerComposeLogOptions extends IDockerComposeOptions {
  follow?: boolean
  timestamps?: boolean
}
```

### Follow logs

Use `follow: true` to stream logs in real-time:

```typescript
compose.logs('service1', {
  cwd: path.join(__dirname),
  follow: true,
  callback: (chunk) => {
    console.log(chunk.toString())
  }
})
```

### Show timestamps

Use `timestamps: true` to show timestamps in the log output:

```typescript
const result = await compose.logs('service1', {
  cwd: path.join(__dirname),
  timestamps: true
})
```

## Command Options

In addition to the [common options](/api#options), `logs` supports these command options:

- `--tail` - Number of lines to show from the end of the logs
- `--since` - Show logs since timestamp
- `--until` - Show logs until timestamp
- `--no-color` - Produce monochrome output

```typescript
compose.logs('service1', {
  cwd: path.join(__dirname),
  commandOptions: [['--tail', '100'], ['--since', '1h']]
})
```

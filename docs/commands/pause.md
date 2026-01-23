---
category: Commands
---

# pause / unpause

Pause and unpause services.

## pauseOne

Pause a service.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

const result = await compose.pauseOne('service1', { cwd: path.join(__dirname) })
```

## unpauseOne

Resume a paused service.

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

const result = await compose.unpauseOne('service1', { cwd: path.join(__dirname) })
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `service` | `string` | The service name to pause/unpause |
| `options` | `IDockerComposeOptions` | Configuration options |

## Example

```typescript
import * as compose from 'docker-compose'
import * as path from 'path'

// Pause the web service
await compose.pauseOne('web', { cwd: path.join(__dirname) })

// Do some maintenance...

// Resume the web service
await compose.unpauseOne('web', { cwd: path.join(__dirname) })
```

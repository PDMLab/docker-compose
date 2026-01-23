import childProcess from 'child_process'
import yaml from 'yaml'
import mapPorts from './map-ports'

export type IDockerComposeExecutableOptions =
  | {
      executablePath: string
      options?: string[] | (string | string[])[]
      standalone?: never
    }
  | {
      executablePath?: string
      options?: never
      standalone: true
    }

export interface IDockerComposeOptions {
  cwd?: string
  executable?: IDockerComposeExecutableOptions
  config?: string | string[]
  configAsString?: string
  log?: boolean
  composeOptions?: string[] | (string | string[])[]
  commandOptions?: string[] | (string | string[])[]
  env?: NodeJS.ProcessEnv
  callback?: (chunk: Buffer, streamSource?: 'stdout' | 'stderr') => void
}

export type DockerComposePortResult = {
  address: string
  port: number
}

export type DockerComposeVersionResult = {
  version: string
}

export type DockerComposeStatsResult = {
  BlockIO: string
  CPUPerc: string
  Container: string
  ID: string
  MemPerc: string
  MemUsage: string
  Name: string
  NetIO: string
  PIDs: string
}

export type DockerComposeConfigResult = {
  config: {
    version: Record<string, string>
    services: Record<string, string | Record<string, string>>
    volumes: Record<string, string>
  }
}

export type DockerComposeConfigServicesResult = {
  services: string[]
}

export type DockerComposeConfigVolumesResult = {
  volumes: string[]
}

export interface IDockerComposeLogOptions extends IDockerComposeOptions {
  follow?: boolean
  timestamps?: boolean
}

export interface IDockerComposeBuildOptions extends IDockerComposeOptions {
  parallel?: boolean
}

export interface IDockerComposePushOptions extends IDockerComposeOptions {
  ignorePushFailures?: boolean
}

export interface IDockerComposeResult {
  exitCode: number | null
  out: string
  err: string
}

export type TypedDockerComposeResult<T> = {
  exitCode: number | null
  out: string
  err: string
  data: T
}

const nonEmptyString = (v: string) => v !== ''

export type DockerComposePsResultService = {
  name: string
  command: string
  state: string
  ports: Array<{
    mapped?: { address: string; port: number }
    exposed: { port: number; protocol: string }
  }>
}

export type DockerComposeImListResultService = {
  container: string
  repository: string
  tag: string
  platform: string
  id: string // 12 Byte id
}

export type DockerComposePsResult = {
  services: Array<DockerComposePsResultService>
}

export type DockerComposeImListResult = {
  services: Array<DockerComposeImListResultService>
}

const arrayIncludesTuple = (
  arr: string[] | (string | string[])[],
  tuple: string[]
) => {
  return arr.some(
    (subArray) =>
      Array.isArray(subArray) &&
      subArray.length === tuple.length &&
      subArray.every((value, index) => value === tuple[index])
  )
}

export const mapPsOutput = (
  output: string,
  options?: IDockerComposeOptions
): DockerComposePsResult => {
  let isQuiet = false
  let isJson = false
  if (options?.commandOptions) {
    isQuiet =
      options.commandOptions.includes('-q') ||
      options.commandOptions.includes('--quiet') ||
      options.commandOptions.includes('--services')

    isJson = arrayIncludesTuple(options.commandOptions, ['--format', 'json'])
  }
  const services = output
    .split(`\n`)
    .filter(nonEmptyString)
    .filter((_, index) => isQuiet || isJson || index >= 1)
    .map((line) => {
      let nameFragment = line
      let commandFragment = ''
      let stateFragment = ''
      let untypedPortsFragment = ''
      if (!isQuiet) {
        if (isJson) {
          const serviceLine = JSON.parse(line)
          nameFragment = serviceLine.Name
          commandFragment = serviceLine.Command
          stateFragment = serviceLine.State
          untypedPortsFragment = serviceLine.Ports
        } else {
          const lineColumns = line.split(/\s{3,}/)
          // the line has the columns in the following order:
          // NAME   IMAGE   COMMAND   SERVICE   CREATED   STATUS   PORTS
          // @see https://docs.docker.com/engine/reference/commandline/compose_ps/#description
          nameFragment = lineColumns[0]
          commandFragment = lineColumns[2]
          stateFragment = lineColumns[5]
          untypedPortsFragment = lineColumns[6]
        }
      }
      return {
        name: nameFragment.trim(),
        command: commandFragment.trim(),
        state: stateFragment.trim(),
        ports: mapPorts(untypedPortsFragment.trim())
      }
    })
  return { services }
}

export const mapImListOutput = (
  output: string,
  options?: IDockerComposeOptions
): DockerComposeImListResult => {
  let isQuiet = false
  let isJson = false
  if (options?.commandOptions) {
    isQuiet =
      options.commandOptions.includes('-q') ||
      options.commandOptions.includes('--quiet')

    isJson = arrayIncludesTuple(options.commandOptions, ['--format', 'json'])
  }

  if (isJson) {
    const data = JSON.parse(output)
    const services = data.map((serviceLine) => {
      let idFragment = serviceLine.ID
      // trim json 64B id format "type:id" to 12B id
      const idTypeIndex = idFragment.indexOf(':')
      if (idTypeIndex > 0)
        idFragment = idFragment.slice(idTypeIndex + 1, idTypeIndex + 13)

      return {
        container: serviceLine.ContainerName,
        repository: serviceLine.Repository,
        tag: serviceLine.Tag,
        platform: serviceLine.Platform || '',
        id: idFragment
      }
    })
    return { services }
  }

  const services = output
    .split(`\n`)
    .filter(nonEmptyString)
    .filter((_, index) => isQuiet || isJson || index >= 1)
    .map((line) => {
      // the line has the columns in the following order:
      // CONTAINER   REPOSITORY   TAG   IMAGE ID   SIZE
      // Note: newer docker compose versions may include PLATFORM column
      const lineColumns = line.split(/\s{3,}/)

      const containerFragment = lineColumns[0] || line
      const repositoryFragment = lineColumns[1] || ''
      const tagFragment = lineColumns[2] || ''
      const idFragment = lineColumns[3] || ''

      return {
        container: containerFragment.trim(),
        repository: repositoryFragment.trim(),
        tag: tagFragment.trim(),
        platform: '',
        id: idFragment.trim()
      } as DockerComposeImListResultService
    })
  return { services }
}

/**
 * Converts supplied yml files to cli arguments
 * https://docs.docker.com/compose/reference/overview/#use--f-to-specify-name-and-path-of-one-or-more-compose-files
 */
const configToArgs = (config): string[] => {
  if (typeof config === 'undefined') {
    return []
  } else if (typeof config === 'string') {
    return ['-f', config]
  } else if (config instanceof Array) {
    return config.reduce(
      (args, item): string[] => args.concat(['-f', item]),
      []
    )
  }
  throw new Error(`Invalid argument supplied: ${config}`)
}

/**
 * Converts docker compose commandline options to cli arguments
 */
const composeOptionsToArgs = (composeOptions): string[] => {
  let composeArgs: string[] = []

  composeOptions.forEach((option: string[] | string): void => {
    if (option instanceof Array) {
      composeArgs = composeArgs.concat(option)
    }
    if (typeof option === 'string') {
      composeArgs = composeArgs.concat([option])
    }
  })

  return composeArgs
}

/**
 * Executes docker compose command with common options
 */
export const execCompose = (
  command,
  args,
  options: IDockerComposeOptions = {}
): Promise<IDockerComposeResult> =>
  new Promise((resolve, reject): void => {
    const composeOptions = options.composeOptions || []
    const commandOptions = options.commandOptions || []
    let composeArgs = composeOptionsToArgs(composeOptions)
    const isConfigProvidedAsString = !!options.configAsString

    const configArgs = isConfigProvidedAsString
      ? ['-f', '-']
      : configToArgs(options.config)

    composeArgs = composeArgs.concat(
      configArgs.concat(
        [command].concat(composeOptionsToArgs(commandOptions), args)
      )
    )

    const cwd = options.cwd
    const env = options.env || undefined
    const executable = options.executable

    let executablePath: string
    let executableArgs: string[] = []

    if (executable?.standalone && !executable.executablePath) {
      executablePath = 'docker-compose'
    } else {
      executablePath = executable?.executablePath || 'docker'
      const executableOptions = executable?.options || []
      executableArgs = [...composeOptionsToArgs(executableOptions), 'compose']
    }

    const childProc = childProcess.spawn(
      executablePath,
      [...executableArgs, ...composeArgs],
      {
        cwd,
        env
      }
    )

    childProc.on('error', (err): void => {
      reject(err)
    })

    const result: IDockerComposeResult = {
      exitCode: null,
      err: '',
      out: ''
    }

    childProc.stdout.on('data', (chunk): void => {
      result.out += chunk.toString()
      options.callback?.(chunk, 'stdout')
    })

    childProc.stderr.on('data', (chunk): void => {
      result.err += chunk.toString()
      options.callback?.(chunk, 'stderr')
    })

    childProc.on('exit', (exitCode): void => {
      result.exitCode = exitCode
      setTimeout(() => {
        if (exitCode === 0) {
          resolve(result)
        } else {
          reject(result)
        }
      }, 500)
    })

    if (isConfigProvidedAsString) {
      childProc.stdin.write(options.configAsString)
      childProc.stdin.end()
    }

    if (options.log) {
      childProc.stdout.pipe(process.stdout)
      childProc.stderr.pipe(process.stderr)
    }
  })

/**
 * Determines whether or not to use the default non-interactive flag -d for up commands
 */
const shouldUseDefaultNonInteractiveFlag = function (
  options: IDockerComposeOptions = {}
): boolean {
  const commandOptions = options.commandOptions || []
  const noDetachModeFlags = [
    '--abort-on-container-exit',
    '--no-start',
    '--attach',
    '--attach-dependencies',
    '--exit-code-from'
  ]
  const containsOtherNonInteractiveFlag = commandOptions.reduce(
    (memo: boolean, item: string | string[]) => {
      return memo && noDetachModeFlags.every((flag) => !item.includes(flag))
    },
    true
  )
  return containsOtherNonInteractiveFlag
}

export const upAll = function (
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  const args = shouldUseDefaultNonInteractiveFlag(options) ? ['-d'] : []
  return execCompose('up', args, options)
}

export const upMany = function (
  services: string[],
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  const args = shouldUseDefaultNonInteractiveFlag(options)
    ? ['-d'].concat(services)
    : services
  return execCompose('up', args, options)
}

export const upOne = function (
  service: string,
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  const args = shouldUseDefaultNonInteractiveFlag(options)
    ? ['-d', service]
    : [service]
  return execCompose('up', args, options)
}

export const downAll = function (
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  return execCompose('down', [], options)
}

export const down = downAll

export const downMany = function (
  services: string[],
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  const args = services
  return execCompose('down', args, options)
}

export const downOne = function (
  service: string,
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  const args = [service]
  return execCompose('down', args, options)
}

export const stop = function (
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  return execCompose('stop', [], options)
}

export const stopOne = function (
  service: string,
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  return execCompose('stop', [service], options)
}

export const stopMany = function (
  options?: IDockerComposeOptions,
  ...services: string[]
): Promise<IDockerComposeResult> {
  return execCompose('stop', [...services], options)
}

export const pauseOne = function (
  service: string,
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  return execCompose('pause', [service], options)
}

export const unpauseOne = function (
  service: string,
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  return execCompose('unpause', [service], options)
}

export const kill = function (
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  return execCompose('kill', [], options)
}

export const rm = function (
  options?: IDockerComposeOptions,
  ...services: string[]
): Promise<IDockerComposeResult> {
  return execCompose('rm', ['-f', ...services], options)
}

export const exec = function (
  container: string,
  command: string | string[],
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  const args = Array.isArray(command) ? command : command.split(/\s+/)

  return execCompose('exec', ['-T', container].concat(args), options)
}

export const run = function (
  container: string,
  command: string | string[],
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  const args = Array.isArray(command) ? command : command.split(/\s+/)

  return execCompose('run', ['-T', container].concat(args), options)
}

export const buildAll = function (
  options: IDockerComposeBuildOptions = {}
): Promise<IDockerComposeResult> {
  return execCompose('build', options.parallel ? ['--parallel'] : [], options)
}

export const buildMany = function (
  services: string[],
  options: IDockerComposeBuildOptions = {}
): Promise<IDockerComposeResult> {
  return execCompose(
    'build',
    options.parallel ? ['--parallel'].concat(services) : services,
    options
  )
}

export const buildOne = function (
  service: string,
  options?: IDockerComposeBuildOptions
): Promise<IDockerComposeResult> {
  return execCompose('build', [service], options)
}

export const createAll = function (
  options: IDockerComposeOptions = {}
): Promise<IDockerComposeResult> {
  return execCompose('create', [], options)
}

export const createMany = function (
  services: string[],
  options: IDockerComposeOptions = {}
): Promise<IDockerComposeResult> {
  return execCompose('create', services, options)
}

export const createOne = function (
  service: string,
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  return execCompose('create', [service], options)
}

export const pullAll = function (
  options: IDockerComposeOptions = {}
): Promise<IDockerComposeResult> {
  return execCompose('pull', [], options)
}

export const pullMany = function (
  services: string[],
  options: IDockerComposeOptions = {}
): Promise<IDockerComposeResult> {
  return execCompose('pull', services, options)
}

export const pullOne = function (
  service: string,
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  return execCompose('pull', [service], options)
}

export const config = async function (
  options?: IDockerComposeOptions
): Promise<TypedDockerComposeResult<DockerComposeConfigResult>> {
  try {
    const result = await execCompose('config', [], options)
    const config = yaml.parse(result.out)
    return {
      ...result,
      data: { config }
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

export const configServices = async function (
  options?: IDockerComposeOptions
): Promise<TypedDockerComposeResult<DockerComposeConfigServicesResult>> {
  try {
    const result = await execCompose('config', ['--services'], options)
    const services = result.out.split('\n').filter(nonEmptyString)
    return {
      ...result,
      data: { services }
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

export const configVolumes = async function (
  options?: IDockerComposeOptions
): Promise<TypedDockerComposeResult<DockerComposeConfigVolumesResult>> {
  try {
    const result = await execCompose('config', ['--volumes'], options)
    const volumes = result.out.split('\n').filter(nonEmptyString)
    return {
      ...result,
      data: { volumes }
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

export const ps = async function (
  options?: IDockerComposeOptions
): Promise<TypedDockerComposeResult<DockerComposePsResult>> {
  try {
    const result = await execCompose('ps', [], options)
    const data = mapPsOutput(result.out, options)
    return {
      ...result,
      data
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

export const images = async function (
  options?: IDockerComposeOptions
): Promise<TypedDockerComposeResult<DockerComposeImListResult>> {
  try {
    // Always use JSON format for robust parsing across docker compose versions
    const jsonOptions: IDockerComposeOptions = {
      ...options,
      commandOptions: [...(options?.commandOptions || []), ['--format', 'json']]
    }
    const result = await execCompose('images', [], jsonOptions)
    const data = mapImListOutput(result.out, jsonOptions)
    return {
      ...result,
      data
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

export const push = function (
  options: IDockerComposePushOptions = {}
): Promise<IDockerComposeResult> {
  return execCompose(
    'push',
    options.ignorePushFailures ? ['--ignore-push-failures'] : [],
    options
  )
}

export const restartAll = function (
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  return execCompose('restart', [], options)
}

export const restartMany = function (
  services: string[],
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  return execCompose('restart', services, options)
}

export const restartOne = function (
  service: string,
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  return restartMany([service], options)
}

export const logs = function (
  services: string | string[],
  options: IDockerComposeLogOptions = {}
): Promise<IDockerComposeResult> {
  const args = Array.isArray(services) ? services : [services]

  if (options.follow) {
    args.unshift('--follow')
  }
  if (options.timestamps) {
    args.unshift('--timestamps')
  }

  return execCompose('logs', args, options)
}

export const port = async function (
  service: string,
  containerPort: string | number,
  options?: IDockerComposeOptions
): Promise<TypedDockerComposeResult<DockerComposePortResult>> {
  const args = [service, containerPort]

  try {
    const result = await execCompose('port', args, options)
    const [address, port] = result.out.split(':')
    return {
      ...result,
      data: {
        address,
        port: Number(port)
      }
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

export const version = async function (
  options?: IDockerComposeOptions
): Promise<TypedDockerComposeResult<DockerComposeVersionResult>> {
  try {
    const result = await execCompose('version', ['--short'], options)
    const version = result.out.replace('\n', '').trim()
    return {
      ...result,
      data: { version }
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

export const stats = async function (
  service: string,
  options?: IDockerComposeOptions
): Promise<DockerComposeStatsResult> {
  const args = ['--no-stream', '--format', '"{{ json . }}"', service]

  try {
    const result = await execCompose('stats', args, options)
    // Remove first and last quote from output, as well as newline.
    const output = result.out.replace('\n', '').trim().slice(1, -1)
    return JSON.parse(output)
  } catch (error) {
    return Promise.reject(error)
  }
}

export default {
  upAll,
  upMany,
  upOne,
  down,
  downAll,
  downOne,
  downMany,
  stop,
  stopOne,
  stopMany,
  pauseOne,
  unpauseOne,
  kill,
  rm,
  exec,
  run,
  buildAll,
  buildMany,
  buildOne,
  pullAll,
  pullMany,
  pullOne,
  config,
  configServices,
  configVolumes,
  ps,
  push,
  restartAll,
  restartMany,
  restartOne,
  logs,
  port,
  version,
  stats
}

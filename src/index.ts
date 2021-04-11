import childProcess from 'child_process'
import yaml from 'yaml'
export interface IDockerComposeOptions {
  cwd?: string
  config?: string | string[]
  configAsString?: string
  log?: boolean
  composeOptions?: string[] | (string | string[])[]
  commandOptions?: string[] | (string | string[])[]
  env?: NodeJS.ProcessEnv
}

export type DockerComposePortResult = {
  address: string
  port: number
}

export type DockerComposeVersionResult = {
  version: string
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

export type DockerComposePsResult = {
  services: Array<{
    name: string
    command: string
    state: string
    ports: Array<{
      mapped?: { address: string; port: number }
      exposed: { port: number; protocol: string }
    }>
  }>
}

export const mapPorts = (
  ports: string
): Array<{
  mapped?: { address: string; port: number }
  exposed: { port: number; protocol: string }
}> => {
  const result = !ports
    ? []
    : (() => {
        return ports.split(',').map((untypedPort) => {
          const exposedFragments = untypedPort.trim().split('->')
          const [port, protocol] =
            exposedFragments.length === 1
              ? exposedFragments[0].split('/')
              : exposedFragments[1].split('/')
          const [address, mappedPort] =
            exposedFragments.length === 2 ? exposedFragments[0].split(':') : []
          return {
            exposed: { port: Number(port), protocol },
            ...(address &&
              mappedPort && { mapped: { port: Number(mappedPort), address } })
          }
        })
      })()
  return result
}

export const mapPsOutput = (output: string): DockerComposePsResult => {
  const services = output
    .split(`\n`)
    .filter(nonEmptyString)
    .filter((_, index) => index > 1)
    .map((line) => {
      const [
        nameFragment,
        commandFragment,
        stateFragment,
        untypedPortsFragment
      ] = line.split(/\s{3,}/)

      return {
        name: nameFragment.trim(),
        command: commandFragment.trim(),
        state: stateFragment.trim(),
        ports: mapPorts(untypedPortsFragment.trim())
      }
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
 * Converts docker-compose commandline options to cli arguments
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
 * Executes docker-compose command with common options
 */
const execCompose = (
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

    const childProc = childProcess.spawn('docker-compose', composeArgs, {
      cwd,
      env
    })

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
    })

    childProc.stderr.on('data', (chunk): void => {
      result.err += chunk.toString()
    })

    childProc.on('exit', (exitCode): void => {
      result.exitCode = exitCode
      if (exitCode === 0) {
        resolve(result)
      } else {
        reject(result)
      }
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
  const containsOtherNonInteractiveFlag = commandOptions.reduce(
    (memo: boolean, item: string | string[]) => {
      return (
        memo &&
        !item.includes('--abort-on-container-exit') &&
        !item.includes('--no-start')
      )
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

export const down = function (
  options?: IDockerComposeOptions
): Promise<IDockerComposeResult> {
  return execCompose('down', [], options)
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
    const data = mapPsOutput(result.out)
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
  let args = Array.isArray(services) ? services : [services]

  if (options.follow) {
    args = ['--follow', ...args]
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
    const version = result.out.replace('\n', '')
    return {
      ...result,
      data: { version }
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

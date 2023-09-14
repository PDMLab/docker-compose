import Docker from 'dockerode'
import * as compose from '../src/index'
import * as path from 'path'
import { readFile } from 'fs'
import { mapPsOutput } from '../src'
const docker = new Docker()

// Docker commands, especially builds, can take some time. This makes sure that they can take the time they need.
jest.setTimeout(25000)

// Set to true if you need to diagnose using output
const logOutput = false

const isContainerRunning = async (name: string): Promise<boolean> =>
  new Promise((resolve, reject): void => {
    docker.listContainers((err, containers): void => {
      if (err) {
        reject(err)
      }

      const running = (containers || []).filter((container): boolean =>
        container.Names.includes(name)
      )

      resolve(running.length > 0)
    })
  })

const repoTags = (imageInfo): string[] => imageInfo.RepoTags || []

const imageExists = async (name: string): Promise<boolean> => {
  const images = await docker.listImages()

  const foundImage = images.findIndex((imageInfo): boolean =>
    repoTags(imageInfo).includes(name)
  )

  return foundImage > -1
}

const removeImagesStartingWith = async (
  searchString: string
): Promise<void> => {
  const images = await docker.listImages()

  for (const image of images) {
    for (const repoTag of repoTags(image)) {
      if (repoTag.startsWith(searchString)) {
        const dockerImage = docker.getImage(repoTag)

        if (logOutput) {
          process.stdout.write(
            `removing image ${repoTag} ${dockerImage.id || ''}`
          )
        }
        await dockerImage.remove()
      }
    }
  }
}

test('ensure container gets started', async (): Promise<void> => {
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput })

  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('ensure exit code is returned correctly', async (): Promise<void> => {
  let result = await compose.down({ cwd: path.join(__dirname), log: logOutput })

  expect(result).toMatchObject({
    exitCode: 0
  })

  result = await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
  expect(result).toMatchObject({
    exitCode: 0
  })

  let failedResult = 0
  try {
    await compose.logs('non_existent_service', {
      cwd: path.join(__dirname)
    })
  } catch (error) {
    failedResult = error.exitCode
  }
  expect(failedResult).toBe(1)

  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

describe('starts containers properly with --build and --timeout options', (): void => {
  beforeEach(
    async (): Promise<void> => {
      await compose.down({
        cwd: path.join(__dirname),
        log: logOutput,
        config: 'docker-compose-build.yml'
      })
    }
  )

  afterEach(
    async (): Promise<void> => {
      await compose.down({
        cwd: path.join(__dirname),
        log: logOutput,
        config: 'docker-compose-build.yml'
      })
    }
  )

  test('ensure container gets started with --build option', async (): Promise<void> => {
    await compose.upAll({
      cwd: path.join(__dirname),
      log: logOutput,
      config: 'docker-compose-build.yml',
      commandOptions: ['--build']
    })

    expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy()
  })

  test('ensure container gets started with --build and --timeout option', async (): Promise<void> => {
    await compose.upAll({
      cwd: path.join(__dirname),
      log: logOutput,
      config: 'docker-compose-build.yml',
      commandOptions: [['--build'], ['--timeout', '5']]
    })

    expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy()
  })

  test('ensure container gets started with --build and --timeout option with different command style', async (): Promise<void> => {
    await compose.upAll({
      cwd: path.join(__dirname),
      log: logOutput,
      config: 'docker-compose-build.yml',
      commandOptions: ['--build', ['--timeout', '5']]
    })

    expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy()
  })
})

test('ensure container command executed with --workdir command option', async (): Promise<void> => {
  await compose.down({
    cwd: path.join(__dirname),
    log: logOutput,
    config: 'docker-compose-42.yml'
  })
  const result = await compose.run('some-service', 'pwd', {
    cwd: path.join(__dirname),
    log: true,
    config: 'docker-compose-42.yml',
    composeOptions: ['--verbose'],

    // Alpine has "/" as default
    commandOptions: ['--workdir', '/home/root']
  })

  expect(result.out).toBe('/home/root\n')

  await compose.down({
    cwd: path.join(__dirname),
    log: logOutput,
    config: 'docker-compose-42.yml'
  })
})

test('ensure only single container gets started', async (): Promise<void> => {
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
  await compose.upOne('web', { cwd: path.join(__dirname), log: logOutput })

  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('ensure only multiple containers get started', async (): Promise<void> => {
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
  await compose.upMany(['web'], { cwd: path.join(__dirname), log: logOutput })

  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('ensure container gets down', async (): Promise<void> => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()

  await compose.down({ cwd: path.join(__dirname), log: logOutput })
  expect(await isContainerRunning('/compose_test_web')).toBeFalsy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()
})

test('ensure container gets stopped', async (): Promise<void> => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()

  await compose.stop({ cwd: path.join(__dirname), log: logOutput })
  expect(await isContainerRunning('/compose_test_web')).toBeFalsy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('ensure only single container gets stopped', async (): Promise<void> => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()

  await compose.stopOne('proxy', { cwd: path.join(__dirname), log: logOutput })
  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('ensure multiple containers gets stopped', async (): Promise<void> => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()

  await compose.stopMany(
    { cwd: path.join(__dirname), log: logOutput },
    'proxy',
    'web'
  )
  expect(await isContainerRunning('/compose_test_web')).toBeFalsy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('ensure only single container gets paused then resumed', async (): Promise<void> => {
  const opts = { cwd: path.join(__dirname), log: logOutput }
  await compose.upAll(opts)
  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()

  await compose.pauseOne('proxy', opts)
  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()
  let errMsg
  try {
    await compose.exec('proxy', 'cat /etc/os-release', opts)
  } catch (err) {
    errMsg = err.err
  }
  expect(errMsg).toContain('is paused')
  await compose.unpauseOne('proxy', opts)
  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()
  const std = await compose.exec('proxy', 'cat /etc/os-release', opts)
  expect(std.out).toContain('Alpine Linux')
  await compose.down(opts)
})

test('ensure container gets started with --abort-on-container-exit option', async (): Promise<void> => {
  const result = await compose.upAll({
    cwd: path.join(__dirname),
    log: logOutput,
    commandOptions: ['--abort-on-container-exit']
  })

  expect(result).toMatchObject({
    exitCode: 0
  })

  expect(await isContainerRunning('/compose_test_web')).toBeFalsy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('ensure container gets started with --abort-on-container-exit option correctly aborts all services when a container exits', async (): Promise<void> => {
  const result = await compose.upAll({
    cwd: path.join(__dirname),
    log: logOutput,
    commandOptions: ['--abort-on-container-exit']
  })

  expect(result.out).toMatch(/Aborting on container exit/)

  expect(await isContainerRunning('/compose_test_web')).toBeFalsy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('ensure container gets killed', async (): Promise<void> => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()

  await compose.kill({ cwd: path.join(__dirname), log: logOutput })
  expect(await isContainerRunning('/compose_test_web')).toBeFalsy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()

  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('ensure custom ymls are working', async (): Promise<void> => {
  const config = './docker-compose-2.yml'
  const cwd = path.join(__dirname)

  await compose.upAll({ cwd, log: logOutput, config })
  expect(await isContainerRunning('/compose_test_web_2')).toBeTruthy()

  // config & [config] are the same thing, ensures that multiple configs are handled properly
  await compose.kill({ cwd, log: logOutput, config: [config] })
  expect(await isContainerRunning('/compose_test_web_2')).toBeFalsy()

  await compose.down({ cwd, log: logOutput, config })
})

test('ensure run and exec are working', async (): Promise<void> => {
  const checkOSID = (out, id): void => {
    // parse /etc/os-release contents
    const re = /([\w,_]+)=(.*)/g
    let match
    const os: { ID?: string } = {}

    while ((match = re.exec(out)) !== null) {
      // eslint-disable-line no-cond-assign
      os[match[1]] = match[2]
    }

    expect(os.ID).toBe(id)
  }

  const opts = { cwd: path.join(__dirname), log: logOutput }

  await compose.upAll(opts)
  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()

  let std = await compose.exec('web', 'cat /etc/os-release', opts)

  checkOSID(std.out, 'debian')

  std = await compose.run('proxy', 'cat /etc/os-release', opts)

  checkOSID(std.out, 'alpine')

  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('ensure run and exec with command defined as array are working', async (): Promise<void> => {
  const checkOSID = (out, id): void => {
    // parse /etc/os-release contents
    const re = /([\w,_]+)=(.*)/g
    let match
    const os: { ID?: string } = {}

    while ((match = re.exec(out)) !== null) {
      // eslint-disable-line no-cond-assign
      os[match[1]] = match[2]
    }

    expect(os.ID).toBe(id)
  }

  const opts = { cwd: path.join(__dirname), log: false }

  await compose.upAll(opts)

  expect(await isContainerRunning('/compose_test_web')).toBe(true)

  let std = await compose.exec(
    'web',
    ['/bin/sh', '-c', 'cat /etc/os-release'],
    opts
  )

  checkOSID(std.out, 'debian')

  std = await compose.run(
    'proxy',
    ['/bin/sh', '-c', 'cat /etc/os-release'],
    opts
  )
  checkOSID(std.out, 'alpine')

  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('build accepts config as string', async (): Promise<void> => {
  const configuration = await new Promise<string>(function (
    resolve,
    reject
  ): void {
    readFile(
      path.join(__dirname, 'docker-compose-2.yml'),
      function (err, content) {
        if (err) {
          reject(err)
          return
        }
        resolve(content.toString())
      }
    )
  })
  const config = {
    configAsString: configuration,
    log: logOutput
  }

  await compose.upAll(config)
  const result = await compose.port('web', 8888, config)

  expect(result.data.address).toBe('0.0.0.0')
  expect(result.data.port).toBe(8888)
  await compose.down(config)
})

test('build single service', async (): Promise<void> => {
  const opts = {
    cwd: path.join(__dirname),
    log: logOutput,
    config: 'docker-compose-build.yml'
  }

  await removeImagesStartingWith('compose-test-build-image')

  await compose.buildOne('build_test_1', opts)

  expect(await imageExists('compose-test-build-image-1:test')).toBeTruthy()
  expect(await imageExists('compose-test-build-image-2:test')).toBeFalsy()
  expect(await imageExists('compose-test-build-image-3:test')).toBeFalsy()
  expect(await imageExists('compose-test-build-image-4:test')).toBeFalsy()

  await removeImagesStartingWith('compose-test-build-image')
})

test('build multiple services', async (): Promise<void> => {
  const opts = {
    cwd: path.join(__dirname),
    log: logOutput,
    config: 'docker-compose-build.yml'
  }

  await compose.buildMany(['build_test_2', 'build_test_3'], opts)

  expect(await imageExists('compose-test-build-image-1:test')).toBeFalsy()
  expect(await imageExists('compose-test-build-image-2:test')).toBeTruthy()
  expect(await imageExists('compose-test-build-image-3:test')).toBeTruthy()
  expect(await imageExists('compose-test-build-image-4:test')).toBeFalsy()

  await removeImagesStartingWith('compose-test-build-image')
})

test('build all services', async (): Promise<void> => {
  const opts = {
    cwd: path.join(__dirname),
    log: logOutput,
    config: 'docker-compose-build.yml'
  }

  await compose.buildAll(opts)

  expect(await imageExists('compose-test-build-image-1:test')).toBeTruthy()
  expect(await imageExists('compose-test-build-image-2:test')).toBeTruthy()
  expect(await imageExists('compose-test-build-image-3:test')).toBeTruthy()
  expect(await imageExists('compose-test-build-image-4:test')).toBeTruthy()

  await removeImagesStartingWith('compose-test-build-image')
})

test('pull single service', async (): Promise<void> => {
  const opts = {
    cwd: path.join(__dirname),
    log: logOutput,
    config: 'docker-compose.yml'
  }

  await removeImagesStartingWith('nginx:1.19.9-alpine')
  expect(await imageExists('nginx:1.19.9-alpine')).toBeFalsy()

  await compose.pullOne('proxy', opts)

  expect(await imageExists('nginx:1.19.9-alpine')).toBeTruthy()
})

test('pull multiple services', async (): Promise<void> => {
  const opts = {
    cwd: path.join(__dirname),
    log: logOutput,
    config: 'docker-compose.yml'
  }

  await removeImagesStartingWith('nginx:1.16.0')
  await removeImagesStartingWith('nginx:1.19.9-alpine')

  expect(await imageExists('nginx:1.16.0')).toBeFalsy()
  expect(await imageExists('nginx:1.19.9-alpine')).toBeFalsy()

  await compose.pullMany(['web', 'proxy'], opts)

  expect(await imageExists('nginx:1.16.0')).toBeTruthy()
  expect(await imageExists('nginx:1.19.9-alpine')).toBeTruthy()
})

test('pull all services', async (): Promise<void> => {
  const opts = {
    cwd: path.join(__dirname),
    log: logOutput,
    config: 'docker-compose.yml'
  }

  await removeImagesStartingWith('nginx:1.16.0')
  await removeImagesStartingWith('nginx:1.19.9-alpine')

  expect(await imageExists('nginx:1.16.0')).toBeFalsy()
  expect(await imageExists('nginx:1.19.9-alpine')).toBeFalsy()

  await compose.pullAll(opts)

  expect(await imageExists('nginx:1.16.0')).toBeTruthy()
  expect(await imageExists('nginx:1.19.9-alpine')).toBeTruthy()
})

test('teardown', async (): Promise<void> => {
  interface Container {
    Names: string[]
    Id: string
  }

  docker.listContainers((err, containers: Container[]): void => {
    if (err) {
      throw err
    }

    containers.forEach((container): void => {
      container.Names.forEach((name: string): void => {
        if (name.startsWith('/compose_test_')) {
          console.log(`stopping ${container.Id} ${container.Names}`)
          docker.getContainer(container.Id).stop()
        }
      })
    })
  })

  await removeImagesStartingWith('compose-test-build-image')
})

test('config show data for docker-compose files', async (): Promise<void> => {
  const std = await compose.config({
    cwd: path.join(__dirname),
    log: logOutput,
    config: 'docker-compose-42.yml'
  })

  expect(std.data.config.version).toBe('3')
  expect(std.data.config.services['some-service']['image']).toBe(
    'nginx:1.19.9-alpine'
  )
  expect(std.data.config.volumes['db-data']).toEqual({})
})

test('config show data for docker-compose files (services)', async (): Promise<void> => {
  const std = await compose.configServices({
    cwd: path.join(__dirname),
    log: logOutput,
    config: 'docker-compose-build.yml'
  })

  expect(std.data.services.length).toBe(5)
  expect(std.data.services[0]).toContain('build_test_1')
  expect(std.err).toBeFalsy()
})

test('config show data for docker-compose files (volumes)', async (): Promise<void> => {
  const std = await compose.configVolumes({
    cwd: path.join(__dirname),
    log: logOutput,
    config: 'docker-compose-42.yml'
  })

  expect(std.data.volumes.length).toBe(1)
  expect(std.data.volumes[0]).toContain('db-data')
  expect(std.err).toBeFalsy()
})

test('ps shows status data for started containers', async (): Promise<void> => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput })

  const std = await compose.ps({ cwd: path.join(__dirname), log: logOutput })

  expect(std.err).toBeFalsy()
  expect(std.data.services!.length).toBe(2)
  const web = std.data.services!.find(
    (service) => service.name === 'compose_test_web'
  )
  expect(std.data.services!.length).toBe(2)
  expect(web?.ports.length).toBe(2)
  expect(web?.ports[0].exposed.port).toBe(443)
  expect(web?.ports[0].exposed.protocol).toBe('tcp')
  expect(web?.ports[0].mapped?.port).toBe(443)
  expect(web?.ports[0].mapped?.address).toBe('0.0.0.0')
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('ps does not show status data for stopped containers', async (): Promise<void> => {
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
  await compose.upOne('web', { cwd: path.join(__dirname), log: logOutput })

  const std = await compose.ps({ cwd: path.join(__dirname), log: logOutput })

  expect(std.err).toBeFalsy()
  const web = std.data.services!.find(
    (service) => service.name === 'compose_test_web'
  )
  const proxy = std.data.services!.find(
    (service) => service.name === 'compose_test_proxy'
  )
  expect(web?.name).toBe('compose_test_web')
  expect(proxy).toBeFalsy()
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('restartAll does restart all containers', async (): Promise<void> => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
  await compose.restartAll({ cwd: path.join(__dirname), log: logOutput })

  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('restartMany does restart selected containers', async (): Promise<void> => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
  await compose.restartMany(['web', 'proxy'], {
    cwd: path.join(__dirname),
    log: logOutput
  })

  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('restartOne does restart container', async (): Promise<void> => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
  await compose.restartOne('proxy', {
    cwd: path.join(__dirname),
    log: logOutput
  })

  expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('logs does follow service logs', async (): Promise<void> => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
  const std = await compose.logs('proxy', {
    cwd: path.join(__dirname),
    log: logOutput
  })

  expect(std.out.includes('compose_test_proxy')).toBeTruthy()
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('returns the port for a started service', async (): Promise<void> => {
  const config = {
    cwd: path.join(__dirname),
    config: './docker-compose-2.yml',
    log: logOutput
  }

  await compose.upAll(config)
  const port = await compose.port('web', 8888, config)

  expect(port.out).toMatch(/.*:[0-9]{1,5}/)
  await compose.down(config)
})

test('removes container', async (): Promise<void> => {
  const config = {
    cwd: path.join(__dirname),
    config: './docker-compose.yml',
    log: logOutput
  }

  await compose.upAll(config)
  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()

  await compose.rm({ ...config, commandOptions: ['-s'] }, 'proxy')
  expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()

  await compose.rm({ ...config, commandOptions: ['-s'] }, 'proxy', 'web')
  expect(await isContainerRunning('/compose_test_web')).toBeFalsy()
  expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()
})

test('returns version information', async (): Promise<void> => {
  const version = (await compose.version()).data.version

  expect(version).toMatch(/^(\d+\.)?(\d+\.)?(\*|\d+)$/)
})

test('parse ps output', () => {
  const output = `NAME                                          IMAGE                                   COMMAND                                                                                     SERVICE           CREATED        STATUS        PORTS\ndashmate_ccf8a8b6_testnet-core-1              dashpay/dashd:20.0.0-beta.1             "/docker-entrypoint.sh dashd"                                                               core              14 hours ago   Up 14 hours   127.0.0.1:19998->19998/tcp, 0.0.0.0:19999->19999/tcp\ndashmate_ccf8a8b6_testnet-dashmate_helper-1   dashpay/dashmate-helper:0.25.0-dev.22   "/platform/packages/dashmate/docker/entrypoint.sh yarn workspace dashmate helper testnet"   dashmate_helper   14 hours ago   Up 14 hours   127.0.0.1:9100->9100/tcp`

  const psOut = mapPsOutput(output)
  expect(psOut.services![0]).toEqual({
    command: '/docker-entrypoint.sh dashd',
    createdAt: '14 hours ago',
    image: 'dashpay/dashd:20.0.0-beta.1',
    name: 'dashmate_ccf8a8b6_testnet-core-1',
    ports: [
      {
        exposed: {
          port: 19998,
          protocol: 'tcp'
        },
        mapped: {
          address: '127.0.0.1',
          port: 19998
        }
      },
      {
        exposed: {
          port: 19999,
          protocol: 'tcp'
        },
        mapped: {
          address: '0.0.0.0',
          port: 19999
        }
      }
    ],
    service: 'core',
    status: 'Up 14 hours'
  })

  expect(psOut.services![1]).toEqual({
    command:
      '/platform/packages/dashmate/docker/entrypoint.sh yarn workspace dashmate helper testnet',
    createdAt: '14 hours ago',
    image: 'dashpay/dashmate-helper:0.25.0-dev.22',
    name: 'dashmate_ccf8a8b6_testnet-dashmate_helper-1',
    ports: [
      {
        exposed: {
          port: 9100,
          protocol: 'tcp'
        },
        mapped: {
          address: '127.0.0.1',
          port: 9100
        }
      }
    ],
    service: 'dashmate_helper',
    status: 'Up 14 hours'
  })
})

test('ps returns container ids when quiet', () => {
  const output = `64848fc721dfeff435edc7d4bb42e2f0e0a10d0c7602b73729a7fd7b09b7586f
aed60ce17575e69c56cc4cb07eeba89b5d7b7b2b307c8b87f3363db6af850719
f49548fa0b1f88846b78c65c6ea7f802bcbdfb2cf10204497eb89ba622d7715b
`
  const psOut = mapPsOutput(output, { commandOptions: ['-q'] })

  expect(psOut.services![0]).toEqual(
    expect.objectContaining({
      name: '64848fc721dfeff435edc7d4bb42e2f0e0a10d0c7602b73729a7fd7b09b7586f'
    })
  )

  expect(psOut.services![1]).toEqual(
    expect.objectContaining({
      name: 'aed60ce17575e69c56cc4cb07eeba89b5d7b7b2b307c8b87f3363db6af850719'
    })
  )

  expect(psOut.services![2]).toEqual(
    expect.objectContaining({
      name: 'f49548fa0b1f88846b78c65c6ea7f802bcbdfb2cf10204497eb89ba622d7715b'
    })
  )
})

test('ps returns container names when --services is passed in options', () => {
  const output = `web
proxy
hello
`
  const psOut = mapPsOutput(output, { commandOptions: ['--services'] })
  expect(psOut.services![0]).toEqual(
    expect.objectContaining({
      name: 'web'
    })
  )

  expect(psOut.services![1]).toEqual(
    expect.objectContaining({
      name: 'proxy'
    })
  )

  expect(psOut.services![2]).toEqual(
    expect.objectContaining({
      name: 'hello'
    })
  )
})

test('ps parse output json when --format json is passed in command options OLD', () => {
  const output = `[{"ID":"993ed42616e7fd52f5a8d127c3a6bbc223f4a878186516644b4ec4f1227e2188","Name":"dashmate_ccc1e5c2_testnet-core-1","Image":"dashpay/dashd:20.0.0-beta.1","Command":"/docker-entrypoint.sh dashd","Project":"dashmate_ccc1e5c2_testnet","Service":"core","Created":1694623078,"State":"running","Status":"Up 14 hours","Health":"","ExitCode":0,"Publishers":[{"URL":"","TargetPort":9998,"PublishedPort":0,"Protocol":"tcp"},{"URL":"","TargetPort":9999,"PublishedPort":0,"Protocol":"tcp"},{"URL":"127.0.0.1","TargetPort":19998,"PublishedPort":19998,"Protocol":"tcp"},{"URL":"0.0.0.0","TargetPort":19999,"PublishedPort":19999,"Protocol":"tcp"}]},{"ID":"47f5e4432bd385a8f20cd9dd45b6f0e4f63d790156a23499ea44bdf4e0063383","Name":"dashmate_ccc1e5c2_testnet-dapi_api-1","Image":"dashpay/dapi:0.25-dev","Command":"docker-entrypoint.sh yarn workspace @dashevo/dapi api","Project":"dashmate_ccc1e5c2_testnet","Service":"dapi_api","Created":1694615525,"State":"running","Status":"Up 14 hours","Health":"","ExitCode":0,"Publishers":[{"URL":"","TargetPort":2500,"PublishedPort":0,"Protocol":"tcp"},{"URL":"","TargetPort":2501,"PublishedPort":0,"Protocol":"tcp"},{"URL":"","TargetPort":2510,"PublishedPort":0,"Protocol":"tcp"}]},{"ID":"4798e618fd4e11b19a12446fc9af7699d5bbcf8bc8b6b877c4ae61b9744b7883","Name":"dashmate_ccc1e5c2_testnet-dapi_envoy-1","Image":"dashpay/envoy:1.22.11","Command":"/etc/envoy/hot-restarter.py /etc/envoy/start_envoy.sh","Project":"dashmate_ccc1e5c2_testnet","Service":"dapi_envoy","Created":1694615525,"State":"running","Status":"Up 14 hours","Health":"","ExitCode":0,"Publishers":[{"URL":"0.0.0.0","TargetPort":10000,"PublishedPort":1443,"Protocol":"tcp"}]},{"ID":"4b4eaf8760041bb259cb74ebd532e18fef194c39e3b8928db569f6a42ae6abb5","Name":"dashmate_ccc1e5c2_testnet-dapi_tx_filter_stream-1","Image":"dashpay/dapi:0.25-dev","Command":"docker-entrypoint.sh yarn workspace @dashevo/dapi core-streams","Project":"dashmate_ccc1e5c2_testnet","Service":"dapi_tx_filter_stream","Created":1694615525,"State":"running","Status":"Up 14 hours","Health":"","ExitCode":0,"Publishers":[{"URL":"","TargetPort":2500,"PublishedPort":0,"Protocol":"tcp"},{"URL":"","TargetPort":2501,"PublishedPort":0,"Protocol":"tcp"},{"URL":"","TargetPort":2510,"PublishedPort":0,"Protocol":"tcp"}]},{"ID":"b127152e084edc75ca6a12ff46dc891b3b7c369d15897eee30c4cb01716f531e","Name":"dashmate_ccc1e5c2_testnet-dashmate_helper-1","Image":"dashpay/dashmate-helper:0.25.0-dev.21","Command":"/platform/packages/dashmate/docker/entrypoint.sh yarn workspace dashmate helper testnet","Project":"dashmate_ccc1e5c2_testnet","Service":"dashmate_helper","Created":1694615525,"State":"running","Status":"Up 14 hours","Health":"","ExitCode":0,"Publishers":[{"URL":"127.0.0.1","TargetPort":9100,"PublishedPort":9100,"Protocol":"tcp"}]},{"ID":"f51e2574a6cd3a8f95bd16c7ff18a9b9b37566708ecb7f27c2dd668685b77a46","Name":"dashmate_ccc1e5c2_testnet-drive_abci-1","Image":"dashpay/drive:0.25-dev","Command":"/usr/bin/drive-abci start","Project":"dashmate_ccc1e5c2_testnet","Service":"drive_abci","Created":1694615525,"State":"running","Status":"Up 14 hours","Health":"","ExitCode":0,"Publishers":[{"URL":"","TargetPort":26658,"PublishedPort":0,"Protocol":"tcp"},{"URL":"","TargetPort":29090,"PublishedPort":0,"Protocol":"tcp"}]},{"ID":"fd4a3aaa0034fab8f227af04046c956bb411321f7d913fea61793f7e0c011a53","Name":"dashmate_ccc1e5c2_testnet-drive_tenderdash-1","Image":"dashpay/tenderdash:0.13-dev","Command":"docker-entrypoint.sh start","Project":"dashmate_ccc1e5c2_testnet","Service":"drive_tenderdash","Created":1694623078,"State":"running","Status":"Up 14 hours","Health":"","ExitCode":0,"Publishers":[{"URL":"127.0.0.1","TargetPort":6060,"PublishedPort":6060,"Protocol":"tcp"},{"URL":"","TargetPort":26656,"PublishedPort":0,"Protocol":"tcp"},{"URL":"","TargetPort":26657,"PublishedPort":0,"Protocol":"tcp"},{"URL":"","TargetPort":26660,"PublishedPort":0,"Protocol":"tcp"},{"URL":"0.0.0.0","TargetPort":36656,"PublishedPort":36656,"Protocol":"tcp"},{"URL":"127.0.0.1","TargetPort":36657,"PublishedPort":36657,"Protocol":"tcp"}]}]`
  const psOut = mapPsOutput(output, { commandOptions: ['--format', 'json'] })
  console.log(psOut)
  expect(psOut.json[0].Name).toEqual('dashmate_ccc1e5c2_testnet-core-1')
})

test('ps parse output json when --format json is passed in command options NEW', () => {
  const output = `{"Command":"\\"/docker-entrypoint.sh dashd\\"","CreatedAt":"2023-09-14 02:56:46 +0700 +07","ExitCode":0,"Health":"","ID":"9dffc928337c41000b90bed6fc19e3df3f5d81d462a2a1f4ab680a729231707a","Image":"dashpay/dashd:20.0.0-beta.1","Labels":"maintainer=Dash Developers \u003cdev@dash.org\u003e,org.opencontainers.image.created=2023-09-05T20:02:45.326Z,com.docker.compose.project.config_files=/Users/pshenmic/WebstormProjects/platform/packages/dashmate/docker-compose.yml,desktop.docker.io/binds/0/SourceKind=hostFile,desktop.docker.io/binds/1/Source=/Users/pshenmic/.dashmate/logs/testnet,com.docker.compose.oneoff=False,com.docker.compose.project=dashmate_ccf8a8b6_testnet,description=Dockerised DashCore,org.opencontainers.image.description=Dash - Reinventing Cryptocurrency,org.opencontainers.image.title=dash,org.opencontainers.image.url=https://github.com/dashpay/dash,com.docker.compose.image=sha256:b9c0950b37db6e09a42f341b4738b6c979161d98a4c2f4e513d0f20937e100ba,desktop.docker.io/binds/1/Target=/var/log/dash,org.dashmate.service.title=Core,com.docker.compose.config-hash=c2600da7ca9c296c0376c45852bb7cad581c3f791b364d46505ce803ca54bf18,com.docker.compose.project.working_dir=/Users/pshenmic/WebstormProjects/platform/packages/dashmate,org.opencontainers.image.ref.name=ubuntu,org.opencontainers.image.licenses=MIT,org.opencontainers.image.revision=bc6360f6aae8acacd6ba829110e47a18386fd3fe,org.opencontainers.image.version=20-beta,com.docker.compose.container-number=1,com.docker.compose.depends_on=,desktop.docker.io/binds/0/Target=/home/dash/.dashcore/dash.conf,com.docker.compose.service=core,com.docker.compose.version=2.21.0,desktop.docker.io/binds/1/SourceKind=hostFile,desktop.docker.io/binds/0/Source=/Users/pshenmic/.dashmate/testnet/core/dash.conf,org.opencontainers.image.source=https://github.com/dashpay/dash","LocalVolumes":"1","Mounts":"dashmate_ccf8a8b6_testnet_core_data,/host_mnt/Users/pshenmic/.dashmate/testnet/core/dash.conf,/host_mnt/Users/pshenmic/.dashmate/logs/testnet","Name":"dashmate_ccf8a8b6_testnet-core-1","Names":"dashmate_ccf8a8b6_testnet-core-1","Networks":"dashmate_ccf8a8b6_testnet_default","Ports":"9998-9999/tcp, 127.0.0.1:19998-\u003e19998/tcp, 0.0.0.0:19999-\u003e19999/tcp","Publishers":[{"URL":"","TargetPort":9998,"PublishedPort":0,"Protocol":"tcp"},{"URL":"","TargetPort":9999,"PublishedPort":0,"Protocol":"tcp"},{"URL":"127.0.0.1","TargetPort":19998,"PublishedPort":19998,"Protocol":"tcp"},{"URL":"0.0.0.0","TargetPort":19999,"PublishedPort":19999,"Protocol":"tcp"}],"RunningFor":"14 hours ago","Service":"core","Size":"0B","State":"running","Status":"Up 14 hours"}\n{"Command":"\\"/platform/packages/dashmate/docker/entrypoint.sh yarn workspace dashmate helper testnet\\"","CreatedAt":"2023-09-14 02:56:46 +0700 +07","ExitCode":0,"Health":"","ID":"63020e2d35e54c47204e77759b3b8c1edf1a51fcbdcce639917d5a53ea138818","Image":"dashpay/dashmate-helper:0.25.0-dev.22","Labels":"com.docker.compose.project=dashmate_ccf8a8b6_testnet,desktop.docker.io/binds/0/Source=/Users/pshenmic/.dashmate,desktop.docker.io/binds/0/Target=/home/dashmate/.dashmate,com.docker.compose.project.config_files=/Users/pshenmic/WebstormProjects/platform/packages/dashmate/docker-compose.yml,maintainer=Dash Developers \u003cdev@dash.org\u003e,com.docker.compose.depends_on=,org.opencontainers.image.description=L2 solution for seriously fast decentralized applications for the Dash network,com.docker.compose.config-hash=1af1f84bab0345b8affaeedc2690b6eb51c0c83ea065742533055483d6fdd1c0,com.docker.compose.project.working_dir=/Users/pshenmic/WebstormProjects/platform/packages/dashmate,org.opencontainers.image.url=https://github.com/dashpay/platform,com.docker.compose.container-number=1,org.dashmate.service.title=Dashmate Helper,org.opencontainers.image.version=0-dev,org.opencontainers.image.source=https://github.com/dashpay/platform,com.docker.compose.oneoff=False,com.docker.compose.service=dashmate_helper,com.docker.compose.version=2.21.0,desktop.docker.io/binds/0/SourceKind=hostFile,org.opencontainers.image.title=platform,com.docker.compose.image=sha256:cdc71a3aac43b02dfa4ee0ed9dfc2db36c7e6c437754c1355021dc4f6bfd246f,description=Dashmate Helper Node.JS,org.opencontainers.image.created=2023-09-08T15:41:47.864Z,org.opencontainers.image.licenses=MIT,desktop.docker.io/binds/1/Source=/var/run/docker.sock,desktop.docker.io/binds/1/SourceKind=dockerSocketProxied,desktop.docker.io/binds/1/Target=/var/run/docker.sock,org.opencontainers.image.revision=fad8dcbcc313e5d717773f4d1e187f1f03b195e5","LocalVolumes":"0","Mounts":"/host_mnt/Users/pshenmic/.dashmate,/run/host-services/docker.proxy.sock","Name":"dashmate_ccf8a8b6_testnet-dashmate_helper-1","Names":"dashmate_ccf8a8b6_testnet-dashmate_helper-1","Networks":"dashmate_ccf8a8b6_testnet_default","Ports":"127.0.0.1:9100-\u003e9100/tcp","Publishers":[{"URL":"127.0.0.1","TargetPort":9100,"PublishedPort":9100,"Protocol":"tcp"}],"RunningFor":"14 hours ago","Service":"dashmate_helper","Size":"0B","State":"running","Status":"Up 14 hours"}`
  const psOut = mapPsOutput(output, { commandOptions: ['--format', 'json'] })
  expect(psOut.json[0].Name).toEqual('dashmate_ccf8a8b6_testnet-core-1')
})

test('ensure progress callback is called', async (): Promise<void> => {
  const config = {
    cwd: path.join(__dirname),
    config: './docker-compose.yml',
    callback: jest.fn()
  }
  await compose.upAll(config)
  expect(config.callback).toBeCalled()
  await compose.down(config)
})

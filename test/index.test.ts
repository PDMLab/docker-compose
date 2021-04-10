import Docker from 'dockerode'
import * as compose from '../src/index'
import * as path from 'path'
import { readFile } from 'fs'
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
  const port = await compose.port('web', 8888, config)

  expect(port.out).toMatch(/.*:[0-9]{1,5}/)
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

  expect(std.err).toBeFalsy()
  expect(std.out.includes('some-service')).toBeTruthy()
  expect(std.out.includes('test/volume:/mountedvolume:rw')).toBeTruthy()
})

test('config show data for docker-compose files (services)', async (): Promise<void> => {
  const std = await compose.configServices({
    cwd: path.join(__dirname),
    log: logOutput,
    config: 'docker-compose-42.yml'
  })

  expect(std.err).toBeFalsy()
  expect(std.out.includes('some-service')).toBeTruthy()
})

test('config show data for docker-compose files (volumes)', async (): Promise<void> => {
  const std = await compose.configVolumes({
    cwd: path.join(__dirname),
    log: logOutput,
    config: 'docker-compose-42.yml'
  })

  expect(std.err).toBeFalsy()
  expect(std.out.includes('db-data')).toBeTruthy()
})

test('ps shows status data for started containers', async (): Promise<void> => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput })

  const std = await compose.ps({ cwd: path.join(__dirname), log: logOutput })

  expect(std.err).toBeFalsy()
  expect(std.out.includes('compose_test_web')).toBeTruthy()
  expect(std.out.includes('compose_test_proxy')).toBeTruthy()
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
})

test('ps does not show status data for stopped containers', async (): Promise<void> => {
  await compose.down({ cwd: path.join(__dirname), log: logOutput })
  await compose.upOne('web', { cwd: path.join(__dirname), log: logOutput })

  const std = await compose.ps({ cwd: path.join(__dirname), log: logOutput })

  expect(std.err).toBeFalsy()
  expect(std.out.includes('compose_test_web')).toBeTruthy()
  expect(std.out.includes('compose_test_proxy')).toBeFalsy()
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
  const version = await compose.version()

  expect(version.out).toBeTruthy()
})

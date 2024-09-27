import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  beforeAll
} from 'vitest'
import Docker, { ContainerInfo } from 'dockerode'
import * as compose from '../src'
import * as path from 'path'
import { readFile } from 'fs'
import { mapPsOutput, mapImListOutput } from '../src'
const docker = new Docker()

const isContainerRunning = async (name: string): Promise<boolean> =>
  new Promise((resolve, reject): void => {
    docker.listContainers((err, containers): void => {
      if (err) {
        reject(err)
      }

      const running = (containers || []).filter((container): boolean =>
        container.Names.includes(name)
      )

      console.log('running containers', running)

      resolve(running.length > 0)
    })
  })

const getAllContainers = async (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    let all = new Array<string>()
    docker.listContainers({ all: true }, (err, containers) => {
      if (err) {
        return reject(err)
      }
      console.log('containers', containers?.length)
      containers?.forEach((container: ContainerInfo) => {
        console.log(container.Id)
        return (all = [...all, container.Id])
      })

      return resolve(all)
    })
  })
}

const getRunningContainers = async (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    let all = new Array<string>()
    docker.listContainers((err, containers) => {
      if (err) {
        return reject(err)
      }
      console.log('containers', containers?.length)
      containers?.forEach((container: ContainerInfo) => {
        console.log(container.Id)
        return (all = [...all, container.Id])
      })

      return resolve(all)
    })
  })
}

const removeContainers = async (containerIds: string[]) => {
  for (const id of containerIds) {
    const container = docker.getContainer(id)
    await container.remove()
  }
}

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

const logOutput = true

describe('when upAll is called', () => {
  it('container get started', async () => {
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
    await compose.upAll({ cwd: path.join(__dirname), log: logOutput })

    expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
    expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })
})

describe('when downOne is called', () => {
  it('only one container should stop', async () => {
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
    await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
    await compose.downOne('web', { cwd: path.join(__dirname), log: logOutput })

    expect(await isContainerRunning('/compose_test_web')).toBeFalsy()
    expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })
})

describe('when downMany is called', () => {
  it('only specified container(s) should stop', async () => {
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
    await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
    await compose.downMany('web', { cwd: path.join(__dirname), log: logOutput })

    expect(await isContainerRunning('/compose_test_web')).toBeFalsy()
    expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })
})

describe('when running a compose command', () => {
  it('should return correct status code', async () => {
    let result = await compose.downAll({
      cwd: path.join(__dirname),
      log: logOutput
    })

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
    } catch (error: any) {
      failedResult = error.exitCode
    }
    expect(failedResult).toBe(1)

    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })
})

describe('when starting container  with --build option', () => {
  describe('starts containers properly', (): void => {
    beforeEach(
      async (): Promise<void> => {
        await compose.downAll({
          cwd: path.join(__dirname),
          log: logOutput,
          config: 'docker-compose-build.yml'
        })
      }
    )

    afterEach(
      async (): Promise<void> => {
        await compose.downAll({
          cwd: path.join(__dirname),
          log: logOutput,
          config: 'docker-compose-build.yml'
        })
      }
    )

    it('container gets started with --build option from array', async (): Promise<void> => {
      await compose.upAll({
        cwd: path.join(__dirname),
        log: logOutput,
        config: 'docker-compose-build.yml',
        commandOptions: [['--build']]
      })

      expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy()
      await compose.downAll({
        cwd: path.join(__dirname),
        log: logOutput,
        config: 'docker-compose-build.yml'
      })
    })

    it('ensure container gets started with --build option from string', async (): Promise<void> => {
      await compose.upAll({
        cwd: path.join(__dirname),
        log: logOutput,
        config: 'docker-compose-build.yml',
        commandOptions: ['--build']
      })

      expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy()
      await compose.downAll({
        cwd: path.join(__dirname),
        log: logOutput,
        config: 'docker-compose-build.yml'
      })
    })
  })
})

describe('when container command executed with --workdir command option', () => {
  it('should work', async () => {
    await compose.downAll({
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

    const all = await getAllContainers()
    console.log('running containers', all)

    await removeContainers(all)
  })
})

describe('when starting a single container', () => {
  it('container gets started', async (): Promise<void> => {
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
    await compose.upOne('web', { cwd: path.join(__dirname), log: logOutput })

    expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
    expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })
})

describe('when starting multiple containers', () => {
  it('all containers get started', async (): Promise<void> => {
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
    await compose.upMany(['web'], { cwd: path.join(__dirname), log: logOutput })

    expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
    expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })
})

describe('when calling down on compose file', () => {
  it('should stop and remove container', async (): Promise<void> => {
    await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
    expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
    expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()

    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
    expect(await isContainerRunning('/compose_test_web')).toBeFalsy()
    expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()

    const all = await getAllContainers()
    expect(all.length).toBe(0)
  })
})

describe('when calling stop on compose file', () => {
  it('ensure container gets stopped', async (): Promise<void> => {
    await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
    expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
    expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()

    await compose.stop({ cwd: path.join(__dirname), log: logOutput })
    expect(await isContainerRunning('/compose_test_web')).toBeFalsy()
    expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()

    const containers = await getAllContainers()
    expect(containers.length).toBe(3)

    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })
})

describe('when stopping only one container', () => {
  it('only this container gets stopped', async (): Promise<void> => {
    await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
    expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
    expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()

    await compose.stopOne('proxy', {
      cwd: path.join(__dirname),
      log: logOutput
    })
    expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
    expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })
})

describe('when stopping multiple containers', () => {
  it('these containers get stopped', async (): Promise<void> => {
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
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })
})

describe('when pausing and resuming a single container', () => {
  it('only single container gets paused then resumed', async (): Promise<void> => {
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
    } catch (err: any) {
      errMsg = err.err
    }
    expect(errMsg).toContain('is paused')
    await compose.unpauseOne('proxy', opts)
    expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
    expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()
    const std = await compose.exec('proxy', 'cat /etc/os-release', opts)
    expect(std.out).toContain('Alpine Linux')
    await compose.downAll(opts)
  })
})

describe('when container gets started with --abort-on-container-exit option', () => {
  it('should start', async (): Promise<void> => {
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
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })
})

describe('when container gets started with --abort-on-container-exit option', () => {
  it('should abort all services when a container exits', async (): Promise<void> => {
    const result = await compose.upAll({
      cwd: path.join(__dirname),
      log: logOutput,
      commandOptions: ['--abort-on-container-exit']
    })

    expect(result.err).toContain('Aborting on container exit')

    expect(await isContainerRunning('/compose_test_web')).toBeFalsy()
    expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })
})

describe('when killing a container', () => {
  it('should not run', async (): Promise<void> => {
    await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
    console.log('up')
    expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
    expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()

    await compose.kill({ cwd: path.join(__dirname), log: logOutput })

    expect(await isContainerRunning('/compose_test_web')).toBeFalsy()
    expect(await isContainerRunning('/compose_test_proxy')).toBeFalsy()

    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })
})

describe('when using custom yml file name', () => {
  it('should be used to start, kill and down containers', async (): Promise<void> => {
    const config = './docker-compose-2.yml'
    const cwd = path.join(__dirname)

    await compose.upAll({ cwd, log: logOutput, config })
    expect(await isContainerRunning('/compose_test_web_2')).toBeTruthy()

    // config & [config] are the same thing, ensures that multiple configs are handled properly
    await compose.kill({ cwd, log: logOutput, config: config })
    expect(await isContainerRunning('/compose_test_web_2')).toBeFalsy()

    await compose.downAll({ cwd, log: logOutput, config })
  })
})

describe('when using run and exec', () => {
  it('containers should run and exec commands', async (): Promise<void> => {
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

    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })

    const ids = await getAllContainers()
    await removeContainers(ids)
  })
})

describe('when using and exec using in an array', (): void => {
  it('containers should run and exec commands', async (): Promise<void> => {
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

    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })

    const ids = await getAllContainers()
    await removeContainers(ids)
  })
})

describe('when using build config as string', (): void => {
  it('build should use config', async (): Promise<void> => {
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
    await compose.downAll(config)
  })
})

describe('when building single service', (): void => {
  it('should only build this service', async (): Promise<void> => {
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
})

describe('when building multiple services', (): void => {
  it('should build these services', async (): Promise<void> => {
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
})

describe('when building all services', (): void => {
  it('should build all services', async (): Promise<void> => {
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
})

describe('when pulling a single service', (): void => {
  it('only this service gets pulled', async (): Promise<void> => {
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
})

describe('when pulling multiple services', (): void => {
  it('pulls multiple services', async (): Promise<void> => {
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
})

describe('when pulling all services', (): void => {
  it('pulls all services', async (): Promise<void> => {
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
})

describe('when calling config command', (): void => {
  it('shows data for docker-compose files', async (): Promise<void> => {
    const std = await compose.config({
      cwd: path.join(__dirname),
      log: logOutput,
      config: 'docker-compose-42.yml'
    })

    // expect(std.data.config.version).toBe('3') // output doesn't include this any longer
    expect(std.data.config.services['some-service']['image']).toBe(
      'nginx:1.19.9-alpine'
    )
    expect(std.data.config.volumes['db-data']).toEqual({ name: 'test_db-data' })
  })
})

describe('when calling config command for services', (): void => {
  it('shows data services', async (): Promise<void> => {
    const std = await compose.configServices({
      cwd: path.join(__dirname),
      log: logOutput,
      config: 'docker-compose-build.yml'
    })

    expect(std.data.services.length).toBe(5)
    expect(std.data.services).toContain('build-nginx')
    expect(std.exitCode).toBe(0)
  })
})

describe('when calling config command for volumes', (): void => {
  it('show data for volumes', async (): Promise<void> => {
    const std = await compose.configVolumes({
      cwd: path.join(__dirname),
      log: logOutput,
      config: 'docker-compose-42.yml'
    })

    expect(std.data.volumes.length).toBe(1)
    expect(std.data.volumes[0]).toContain('db-data')
    expect(std.exitCode).toBe(0)
  })
})

describe('when calling ps command', (): void => {
  it('ps shows status data for started containers', async (): Promise<void> => {
    await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
    // await new Promise((resolve) => setTimeout(resolve, 2000))

    const std = await compose.ps({ cwd: path.join(__dirname), log: logOutput })

    const running = await getRunningContainers()

    expect(std.exitCode).toBe(0)
    expect(std.data.services.length).toBe(2)
    const web = std.data.services.find(
      (service) => service.name === 'compose_test_web'
    )
    expect(web?.command).toContain('nginx') // Note: actually it contains "nginx -g 'daemon off;'"
    expect(web?.state).toContain('Up')
    expect(web?.ports.length).toBe(2)
    expect(web?.ports[1].exposed.port).toBe(443)
    expect(web?.ports[1].exposed.protocol).toBe('tcp')
    expect(web?.ports[1].mapped?.port).toBe(443)
    expect(web?.ports[1].mapped?.address).toBe('0.0.0.0')
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })

  it('ps shows status data for started containers using json format', async (): Promise<void> => {
    await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
    // await new Promise((resolve) => setTimeout(resolve, 2000))

    const std = await compose.ps({
      cwd: path.join(__dirname),
      log: logOutput,
      commandOptions: [['--format', 'json']]
    })

    const running = await getRunningContainers()

    expect(std.exitCode).toBe(0)
    expect(std.data.services.length).toBe(2)
    const web = std.data.services.find(
      (service) => service.name === 'compose_test_web'
    )
    expect(web?.command).toContain('nginx') // Note: actually it contains "nginx -g 'daemon off;'"
    expect(web?.state).toBe('running')
    expect(web?.ports.length).toBe(2)
    expect(web?.ports[1].exposed.port).toBe(443)
    expect(web?.ports[1].exposed.protocol).toBe('tcp')
    expect(web?.ports[1].mapped?.port).toBe(443)
    expect(web?.ports[1].mapped?.address).toBe('0.0.0.0')
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })

  it('ps does not show status data for stopped containers', async (): Promise<void> => {
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
    // await new Promise((resolve) => setTimeout(resolve, 1000))
    await compose.upOne('web', { cwd: path.join(__dirname), log: logOutput })
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const std = await compose.ps({ cwd: path.join(__dirname), log: logOutput })

    console.log('data', std.data.services)
    expect(std.data.services.length).toBe(1)
    expect(std.exitCode).toBe(0)
    const web = std.data.services.find(
      (service) => service.name === 'compose_test_web'
    )
    const proxy = std.data.services.find(
      (service) => service.name === 'compose_test_proxy'
    )
    expect(web?.name).toBe('compose_test_web')
    expect(proxy).toBeFalsy()
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  }, 30000)
})

describe('when calling image list command', (): void => {
  it('image list shows image data', async (): Promise<void> => {
    await compose.createAll({ cwd: path.join(__dirname), log: logOutput })

    const std = await compose.images({
      cwd: path.join(__dirname),
      log: logOutput
    })
    console.log(std.out)

    expect(std.exitCode).toBe(0)
    expect(std.data.services.length).toBe(3)
    const web = std.data.services.find(
      (service) => service.container === 'compose_test_web'
    )
    expect(web).toBeDefined()
    expect(web?.repository).toBe('nginx')
    expect(web?.tag).toBe('1.16.0')
    expect(web?.id).toBeTruthy()
    expect(web?.id).toMatch(/^\w{12}$/)

    const hello = std.data.services.find(
      (service) => service.container === 'compose_test_hello'
    )
    expect(hello).toBeDefined()
    expect(hello?.repository).toBe('hello-world')
    expect(hello?.tag).toBe('latest')
    expect(hello?.id).toMatch(/^\w{12}$/)
  })

  it('image list shows image data using json format', async (): Promise<void> => {
    await compose.createAll({ cwd: path.join(__dirname), log: logOutput })

    const std = await compose.images({
      cwd: path.join(__dirname),
      log: logOutput,
      commandOptions: [['--format', 'json']]
    })

    expect(std.exitCode).toBe(0)
    expect(std.data.services.length).toBe(3)

    const web = std.data.services.find(
      (service) => service.container === 'compose_test_web'
    )
    expect(web).toBeDefined()
    expect(web?.repository).toBe('nginx')
    expect(web?.tag).toBe('1.16.0')
    expect(web?.id).toMatch(/^\w{12}$/)

    const hello = std.data.services.find(
      (service) => service.container === 'compose_test_hello'
    )
    expect(hello).toBeDefined()
    expect(hello?.repository).toBe('hello-world')
    expect(hello?.tag).toBe('latest')
    expect(hello?.id).toMatch(/^\w{12}$/)
  })
})

describe('when restarting all containers', (): void => {
  it('all containers restart', async (): Promise<void> => {
    await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
    await compose.restartAll({ cwd: path.join(__dirname), log: logOutput })

    expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
    expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })
})

describe('when restarting many containers', (): void => {
  it('restarts selected containers', async (): Promise<void> => {
    await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
    await compose.restartMany(['web', 'proxy'], {
      cwd: path.join(__dirname),
      log: logOutput
    })

    expect(await isContainerRunning('/compose_test_web')).toBeTruthy()
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })
})

describe('when restarting one container', (): void => {
  it('does restart one container', async (): Promise<void> => {
    await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
    await compose.restartOne('proxy', {
      cwd: path.join(__dirname),
      log: logOutput
    })

    expect(await isContainerRunning('/compose_test_proxy')).toBeTruthy()
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })
})

describe('logs command', (): void => {
  it('does follow service logs', async (): Promise<void> => {
    await compose.upAll({ cwd: path.join(__dirname), log: logOutput })
    const std = await compose.logs('proxy', {
      cwd: path.join(__dirname),
      log: logOutput
    })

    expect(std.out.includes('compose_test_proxy')).toBeTruthy()
    await compose.downAll({ cwd: path.join(__dirname), log: logOutput })
  })
})

describe('port command', (): void => {
  it('returns the port for a started service', async (): Promise<void> => {
    const config = {
      cwd: path.join(__dirname),
      config: './docker-compose-2.yml',
      log: logOutput
    }

    await compose.upAll(config)
    const port = await compose.port('web', 8888, config)

    expect(port.out).toMatch(/.*:[0-9]{1,5}/)
    await compose.downAll(config)
  })
})

describe('rm command', (): void => {
  it('removes container', async (): Promise<void> => {
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
})

describe('version command', (): void => {
  it('returns version information', async (): Promise<void> => {
    const version = (await compose.version()).data.version

    expect(version).toMatch(/^(\d+\.)?(\d+\.)?(\*|\d+)?(\+.*)*(-\w+(\.\d+))?$/)
  })
})

describe('parsePsOutput', (): void => {
  it('parses ps output', () => {
    // eslint-disable-next-line no-useless-escape
    const output = `NAME                 IMAGE                 COMMAND                  SERVICE             CREATED             STATUS                              PORTS\ncompose_test_hello   hello-world           \"/hello\"                 hello               2 seconds ago       Exited (0) Less than a second ago   \ncompose_test_proxy   nginx:1.19.9-alpine   \"/docker-entrypoint.…\"   proxy               2 seconds ago       Up Less than a second               80/tcp\ncompose_test_web     nginx:1.16.0          \"nginx -g 'daemon of…\"   web                 2 seconds ago       Up 1 second                         0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp\n`

    const psOut = mapPsOutput(output)

    // prettier-ignore
    expect(psOut.services[0]).toEqual({
      command: '"/hello"',
      name: 'compose_test_hello',
      state: 'Exited (0) Less than a second ago',
      ports: []
    })

    // prettier-ignore
    expect(psOut.services[1]).toEqual({
      command: '"/docker-entrypoint.…"',
      name: 'compose_test_proxy',
      state: 'Up Less than a second',
      ports: [{ exposed: { port: 80, protocol: 'tcp' } }]
    })

    expect(psOut.services[2]).toEqual({
      command: '"nginx -g \'daemon of…"',
      name: 'compose_test_web',
      state: 'Up 1 second',
      ports: [
        {
          exposed: { port: 80, protocol: 'tcp' },
          mapped: { port: 80, address: '0.0.0.0' }
        },
        {
          exposed: { port: 443, protocol: 'tcp' },
          mapped: { port: 443, address: '0.0.0.0' }
        }
      ]
    })
  })
})

describe('ps command in quiet mode', (): void => {
  it('ps returns container ids when quiet', () => {
    const output = `64848fc721dfeff435edc7d4bb42e2f0e0a10d0c7602b73729a7fd7b09b7586f
aed60ce17575e69c56cc4cb07eeba89b5d7b7b2b307c8b87f3363db6af850719
f49548fa0b1f88846b78c65c6ea7f802bcbdfb2cf10204497eb89ba622d7715b
`
    const psOut = mapPsOutput(output, { commandOptions: ['-q'] })

    expect(psOut.services[0]).toEqual(
      expect.objectContaining({
        name: '64848fc721dfeff435edc7d4bb42e2f0e0a10d0c7602b73729a7fd7b09b7586f'
      })
    )

    expect(psOut.services[1]).toEqual(
      expect.objectContaining({
        name: 'aed60ce17575e69c56cc4cb07eeba89b5d7b7b2b307c8b87f3363db6af850719'
      })
    )

    expect(psOut.services[2]).toEqual(
      expect.objectContaining({
        name: 'f49548fa0b1f88846b78c65c6ea7f802bcbdfb2cf10204497eb89ba622d7715b'
      })
    )
  })
})

describe('ps command with --services flag', (): void => {
  it('returns container names when --services is passed in options', () => {
    const output = `web
proxy
hello
`
    const psOut = mapPsOutput(output, { commandOptions: ['--services'] })
    expect(psOut.services[0]).toEqual(
      expect.objectContaining({
        name: 'web'
      })
    )

    expect(psOut.services[1]).toEqual(
      expect.objectContaining({
        name: 'proxy'
      })
    )

    expect(psOut.services[2]).toEqual(
      expect.objectContaining({
        name: 'hello'
      })
    )
  })
})

describe('parseImListOutput', (): void => {
  it('parses image list output', () => {
    // eslint-disable-next-line no-useless-escape
    const output =
      'CONTAINER            REPOSITORY          TAG                 IMAGE ID            SIZE\ncompose_test_hello   hello-world         latest              d2c94e258dcb        13.3kB\ncompose_test_proxy   nginx               1.19.9-alpine       72ab4137bd85        22.6MB\ncompose_test_web     nginx               1.16.0              ae893c58d83f        109MB\n'

    const psOut = mapImListOutput(output)

    // prettier-ignore
    expect(psOut.services[0]).toEqual({
      container: 'compose_test_hello',
      repository: 'hello-world',
      tag: 'latest',
      id: 'd2c94e258dcb'
    })

    // prettier-ignore
    expect(psOut.services[1]).toEqual({
      container: 'compose_test_proxy',
      repository: 'nginx',
      tag: '1.19.9-alpine',
      id: '72ab4137bd85'
    })

    expect(psOut.services[2]).toEqual({
      container: 'compose_test_web',
      repository: 'nginx',
      tag: '1.16.0',
      id: 'ae893c58d83f'
    })
  })
})

describe('image list command in quiet mode', (): void => {
  it('image list returns container ids when quiet', () => {
    const output =
      '72ab4137bd85aae7970407cbf4ba98ec0a7cb9d302e93a38bb665ba5fddf6f5d\nae893c58d83fe2bd391fbec97f5576c9a34fea55b4ee9daf15feb9620b14b226\nd2c94e258dcb3c5ac2798d32e1249e42ef01cba4841c2234249495f87264ac5a\n'

    const psOut = mapImListOutput(output, { commandOptions: ['-q'] })

    expect(psOut.services[0]).toEqual(
      expect.objectContaining({
        container:
          '72ab4137bd85aae7970407cbf4ba98ec0a7cb9d302e93a38bb665ba5fddf6f5d'
      })
    )

    expect(psOut.services[1]).toEqual(
      expect.objectContaining({
        container:
          'ae893c58d83fe2bd391fbec97f5576c9a34fea55b4ee9daf15feb9620b14b226'
      })
    )

    expect(psOut.services[2]).toEqual(
      expect.objectContaining({
        container:
          'd2c94e258dcb3c5ac2798d32e1249e42ef01cba4841c2234249495f87264ac5a'
      })
    )
  })
})

describe('passed callback fn', (): void => {
  it('is called', async (): Promise<void> => {
    const config = {
      cwd: path.join(__dirname),
      config: './docker-compose.yml',
      callback: vi.fn()
    }
    await compose.upAll(config)
    expect(config.callback).toBeCalled()
    await compose.downAll(config)
  })
})

describe('when upAll is called', () => {
  // relying on bash echo to know when a container is up and has its stdout forwarded to this process (aka, not --detach)
  const ECHO_MSG = 'hello from a container tst msg'
  const options2test = [
    ['--attach', 'echo', true],
    ['--exit-code-from', 'echo', true],
    ['--abort-on-container-exit', 'echo', true],
    ['--wait', 'echo', false]
  ]

  beforeAll(async () => {
    await compose.downAll({
      cwd: path.join(__dirname),
      log: logOutput,
      config: 'docker-compose-echo.yml'
    })
  })

  afterEach(async () => {
    await compose.kill({
      cwd: path.join(__dirname),
      log: logOutput,
      config: 'docker-compose-echo.yml'
    })
  })

  options2test.forEach((optPair) => {
    it(`with ${optPair[0]}, a container gets started ${
      optPair[2] ? 'not' : ''
    } in the detached mode`, () => {
      return new Promise((resolve, reject) => {
        let doneFlag = false
        compose
          .upAll({
            cwd: path.join(__dirname),
            log: logOutput,
            config: 'docker-compose-echo.yml',
            commandOptions: [[optPair[0], optPair[1]]],
            callback: (chunk, streamType) => {
              if (
                streamType === 'stdout' &&
                !doneFlag &&
                chunk.toString().includes('|') // else these are set-up messages, not echos from a container
              ) {
                doneFlag = true
                expect(chunk.toString().includes(ECHO_MSG)).toBe(optPair[2])
                optPair[2]
                  ? resolve('all ok')
                  : reject(
                      `Container was run ${
                        optPair[2] ? '' : 'not'
                      } in the detached mode.`
                    )
              }
            }
          })
          .then(() => {
            optPair[2]
              ? reject(
                  `Container was run ${
                    optPair[2] ? 'not' : ''
                  } in the detached mode.`
                )
              : resolve('all ok')
          })
          .catch((e) => {
            if (e.exitCode === 137) {
              // swallowing this reject -- so it doesn't complain about being SIGKILLed
              return
            }
            throw e // else re-throwing
          })
      })
    })
  })
})

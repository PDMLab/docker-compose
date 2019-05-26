'use strict';

const compose = require('../index');
const path = require('path');
const Docker = require('dockerode');
const docker = new Docker();

// Docker commands, especially builds, can take some time. This makes sure that they can take the time they need.
jest.setTimeout(25000);

// Set to true if you need to diagnose using output
const logOutput = false;

const isContainerRunning = async name => new Promise((resolve, reject) => {
  docker.listContainers((err, containers) => {
    if (err) {
      reject(err);
    }

    const running = containers.filter(container => container.Names.includes(name));

    resolve(running.length > 0);
  });
});

const repoTags = imageInfo => imageInfo.RepoTags || [];

const imageExists = async name => {
  const images = await docker.listImages();

  const foundImage = images.findIndex(imageInfo => repoTags(imageInfo).includes(name));

  return foundImage > -1;
};

const removeImagesStartingWith = async searchString => {
  const images = await docker.listImages();

  for (const image of images) {
    for (const repoTag of repoTags(image)) {
      if (repoTag.startsWith(searchString)) {
        const dockerImage = docker.getImage(repoTag);

        if (logOutput) {
          process.stdout.write(`removing image ${repoTag} ${dockerImage.id || ''}`);
        }
        await dockerImage.remove();
      }
    }
  }
};

test('ensure container gets started', async () => {
  await compose.down({ cwd: path.join(__dirname), log: logOutput });
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput });

  expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy();
  await compose.down({ cwd: path.join(__dirname), log: logOutput });
});

test('ensure exit code is returned correctly', async () => {
  let result = await compose.down({ cwd: path.join(__dirname), log: logOutput });

  await expect(result).toMatchObject({
    exitCode: 0
  });

  result = await compose.upAll({ cwd: path.join(__dirname), log: logOutput });
  expect(result).toMatchObject({
    exitCode: 0
  });
  try {
    await compose.logs('non_existent_service', { cwd: path.join(__dirname) });
    expect(false).toBeTruthy();
  } catch (rejectionResult) {
    expect(rejectionResult.exitCode).toBe(1);
  }
  await compose.down({ cwd: path.join(__dirname), log: logOutput });
});

describe('starts containers properly with --build and --timeout options', () => {
  beforeEach(async () => {
    await compose.down({ cwd: path.join(__dirname), log: logOutput, config: 'docker-compose-build.yml' });
  });

  afterEach(async () => {
    await compose.down({ cwd: path.join(__dirname), log: logOutput, config: 'docker-compose-build.yml' });
  });

  test('ensure container gets started with --build option', async () => {
    await compose.upAll({
      cwd: path.join(__dirname),
      log: logOutput,
      config: 'docker-compose-build.yml',
      commandOptions: [ '--build' ]
    });

    expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy();
  });

  test('ensure container gets started with --build and --timeout option', async () => {
    await compose.upAll({
      cwd: path.join(__dirname),
      log: logOutput,
      config: 'docker-compose-build.yml',
      commandOptions: [[ '--build' ], [ '--timeout', '5' ]]
    });

    expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy();
  });

  test('ensure container gets started with --build and --timeout option with different command style', async () => {
    await compose.upAll({
      cwd: path.join(__dirname),
      log: logOutput,
      config: 'docker-compose-build.yml',
      commandOptions: [ '--build', [ '--timeout', '5' ]]
    });

    expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy();
  });
});

test('ensure container command executed with --workdir command option', async () => {
  await compose.down({ cwd: path.join(__dirname), log: logOutput, config: 'docker-compose-42.yml' });
  const result = await compose.run('some-service', 'pwd', {
    cwd: path.join(__dirname),
    log: true,
    config: 'docker-compose-42.yml',
    composeOptions: [ '--verbose' ],

    // Alpine has "/" as default
    commandOptions: [ '--workdir', '/home/root' ]
  });

  expect(result.out).toBe('/home/root\n');

  await compose.down({ cwd: path.join(__dirname), log: logOutput, config: 'docker-compose-42.yml' });
});

test('ensure only single container gets started', async () => {
  await compose.down({ cwd: path.join(__dirname), log: logOutput });
  await compose.upOne('alpine', { cwd: path.join(__dirname), log: logOutput });

  expect(await isContainerRunning('/compose_test_alpine')).toBeTruthy();
  expect(await isContainerRunning('/compose_test_nginx')).toBeFalsy();
  await compose.down({ cwd: path.join(__dirname), log: logOutput });
});

test('ensure only multiple containers get started', async () => {
  await compose.down({ cwd: path.join(__dirname), log: logOutput });
  await compose.upMany([ 'alpine' ], { cwd: path.join(__dirname), log: logOutput });

  expect(await isContainerRunning('/compose_test_alpine')).toBeTruthy();
  expect(await isContainerRunning('/compose_test_nginx')).toBeFalsy();
  await compose.down({ cwd: path.join(__dirname), log: logOutput });
});

test('ensure container gets down', async () => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput });
  expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy();

  await compose.down({ cwd: path.join(__dirname), log: logOutput });
  expect(await isContainerRunning('/compose_test_nginx')).toBeFalsy();
});

test('ensure container gets stopped', async () => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput });
  expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy();

  await compose.stop({ cwd: path.join(__dirname), log: logOutput });
  expect(await isContainerRunning('/compose_test_nginx')).toBeFalsy();
  await compose.down({ cwd: path.join(__dirname), log: logOutput });
});

test('ensure container gets killed', async () => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput });
  expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy();

  await compose.kill({ cwd: path.join(__dirname), log: logOutput });
  expect(await isContainerRunning('/compose_test_nginx')).toBeFalsy();

  await compose.down({ cwd: path.join(__dirname), log: logOutput });
});

test('ensure custom ymls are working', async () => {
  const config = './docker-compose-2.yml';
  const cwd = path.join(__dirname);

  await compose.upAll({ cwd, log: logOutput, config });
  expect(await isContainerRunning('/compose_test_nginx_2')).toBeTruthy();

  // config & [config] are the same thing, ensures that multiple configs are handled properly
  await compose.kill({ cwd, log: logOutput, config: [ config ]});
  expect(await isContainerRunning('/compose_test_nginx_2')).toBeFalsy();

  await compose.down({ cwd, log: logOutput, config });
});

test('ensure run and exec are working', async () => {
  const checkOSID = (out, id) => {
    // parse /etc/os-release contents
    const re = /([\w,_]+)=(.*)/g;
    let match;
    const os = {};

    while ((match = re.exec(out)) !== null) { // eslint-disable-line no-cond-assign
      os[match[1]] = match[2];
    }

    expect(os.ID).toBe(id);
  };

  const opts = { cwd: path.join(__dirname), log: logOutput };

  await compose.upAll(opts);

  expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy();

  let std = await compose.exec('db', 'cat /etc/os-release', opts);

  expect(std.err).toBeFalsy();
  checkOSID(std.out, 'debian');

  std = await compose.run('alpine', 'cat /etc/os-release', opts);
  expect(std.err).toBeFalsy();
  checkOSID(std.out, 'alpine');

  await compose.down({ cwd: path.join(__dirname), log: logOutput });
});

test('ensure run and exec with command defined as array are working', async () => {
  const checkOSID = (out, id) => {
    // parse /etc/os-release contents
    const re = /([\w,_]+)=(.*)/g;
    let match;
    const os = {};

    while ((match = re.exec(out)) !== null) { // eslint-disable-line no-cond-assign
      os[match[1]] = match[2];
    }

    expect(os.ID).toBe(id);
  };

  const opts = { cwd: path.join(__dirname), log: false };

  await compose.upAll(opts);

  expect(await isContainerRunning('/compose_test_nginx')).toBe(true);

  let std = await compose.exec('db', [ '/bin/sh', '-c', 'cat /etc/os-release' ], opts);

  expect(std.err).toBeFalsy();
  checkOSID(std.out, 'debian');

  std = await compose.run('alpine', [ '/bin/sh', '-c', 'cat /etc/os-release' ], opts);
  expect(std.err).toBeFalsy();
  checkOSID(std.out, 'alpine');

  await compose.down({ cwd: path.join(__dirname), log: logOutput });
});

test('build single service', async () => {
  const opts = {
    cwd: path.join(__dirname),
    log: logOutput,
    config: 'docker-compose-build.yml'
  };

  await removeImagesStartingWith('compose-test-build-image');

  await compose.buildOne('build_test_1', opts);

  expect(await imageExists('compose-test-build-image-1:test')).toBeTruthy();
  expect(await imageExists('compose-test-build-image-2:test')).toBeFalsy();
  expect(await imageExists('compose-test-build-image-3:test')).toBeFalsy();
  expect(await imageExists('compose-test-build-image-4:test')).toBeFalsy();

  await removeImagesStartingWith('compose-test-build-image');
});

test('build multiple services', async () => {
  const opts = {
    cwd: path.join(__dirname),
    log: logOutput,
    config: 'docker-compose-build.yml'
  };

  await compose.buildMany([ 'build_test_2', 'build_test_3' ], opts);

  expect(await imageExists('compose-test-build-image-1:test')).toBeFalsy();
  expect(await imageExists('compose-test-build-image-2:test')).toBeTruthy();
  expect(await imageExists('compose-test-build-image-3:test')).toBeTruthy();
  expect(await imageExists('compose-test-build-image-4:test')).toBeFalsy();

  await removeImagesStartingWith('compose-test-build-image');
});

test('build all services', async () => {
  const opts = {
    cwd: path.join(__dirname),
    log: logOutput,
    config: 'docker-compose-build.yml'
  };

  await compose.buildAll(opts);

  expect(await imageExists('compose-test-build-image-1:test')).toBeTruthy();
  expect(await imageExists('compose-test-build-image-2:test')).toBeTruthy();
  expect(await imageExists('compose-test-build-image-3:test')).toBeTruthy();
  expect(await imageExists('compose-test-build-image-4:test')).toBeTruthy();

  await removeImagesStartingWith('compose-test-build-image');
});

test('teardown', async () => {
  docker.listContainers((err, containers) => {
    if (err) {
      throw err;
    }

    containers.forEach(container => {
      container.Names.forEach(name => {
        if (name.startsWith('/compose_test_')) {
          console.log(`stopping ${container.Id} ${container.Names}`);
          docker.getContainer(container.Id).stop();
        }
      });
    });
  });

  await removeImagesStartingWith('compose-test-build-image');
});

test('config show data for docker-compose files', async () => {
  const std = await compose.config({ cwd: path.join(__dirname), log: logOutput, config: 'docker-compose-42.yml' });

  expect(std.err).toBeFalsy();
  expect(std.out.includes('some-service')).toBeTruthy();
  expect(std.out.includes('test/volume:/mountedvolume:rw')).toBeTruthy();
});

test('config show data for docker-compose files (services)', async () => {
  const std = await compose.configServices({ cwd: path.join(__dirname), log: logOutput, config: 'docker-compose-42.yml' });

  expect(std.err).toBeFalsy();
  expect(std.out.includes('some-service')).toBeTruthy();
});

test('config show data for docker-compose files (volumes)', async () => {
  const std = await compose.configVolumes({ cwd: path.join(__dirname), log: logOutput, config: 'docker-compose-42.yml' });

  expect(std.err).toBeFalsy();
  expect(std.out.includes('db-data')).toBeTruthy();
});

test('ps shows status data for started containers', async () => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput });

  const std = await compose.ps({ cwd: path.join(__dirname), log: logOutput });

  expect(std.err).toBeFalsy();
  expect(std.out.includes('compose_test_alpine')).toBeTruthy();
  expect(std.out.includes('compose_test_nginx')).toBeTruthy();
  await compose.down({ cwd: path.join(__dirname), log: logOutput });
});

test('ps does not show status data for stopped containers', async () => {
  await compose.down({ cwd: path.join(__dirname), log: logOutput });
  await compose.upOne('alpine', { cwd: path.join(__dirname), log: logOutput });

  const std = await compose.ps({ cwd: path.join(__dirname), log: logOutput });

  expect(std.err).toBeFalsy();
  expect(std.out.includes('compose_test_alpine')).toBeTruthy();
  expect(std.out.includes('compose_test_nginx')).toBeFalsy();
  await compose.down({ cwd: path.join(__dirname), log: logOutput });
});

test('restartAll does restart all containers', async () => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput });
  await compose.restartAll({ cwd: path.join(__dirname), log: logOutput });

  expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy();
  await compose.down({ cwd: path.join(__dirname), log: logOutput });
});

test('restartMany does restart selected containers', async () => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput });
  await compose.restartMany([ 'db', 'alpine' ], { cwd: path.join(__dirname), log: logOutput });

  expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy();
  await compose.down({ cwd: path.join(__dirname), log: logOutput });
});

test('restartOne does restart container', async () => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput });
  await compose.restartOne('db', { cwd: path.join(__dirname), log: logOutput });

  expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy();
  await compose.down({ cwd: path.join(__dirname), log: logOutput });
});

test('logs does follow service logs', async () => {
  await compose.upAll({ cwd: path.join(__dirname), log: logOutput });
  await compose.logs('db', { cwd: path.join(__dirname), log: logOutput });

  expect(await isContainerRunning('/compose_test_nginx')).toBeTruthy();
  await compose.down({ cwd: path.join(__dirname), log: logOutput });
});

test('returns the port for a started service', async () => {
  const config = {
    cwd: path.join(__dirname),
    config: './docker-compose-2.yml',
    log: logOutput
  };

  await compose.upAll(config);
  const port = await compose.port('db', 5432, config);

  expect(port.out).toMatch(/.*:[0-9]{1,5}/);
  await compose.down(config);
});

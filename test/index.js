'use strict';

const compose = require('../index');
const path = require('path');
const tape = require('tape');
const defaultTest = require('tape-promise').default;
const test = defaultTest(tape);
const Docker = require('dockerode');
const docker = new Docker();

const isContainerRunning = async name => new Promise((resolve, reject) => {
  docker.listContainers((err, containers) => {
    if (err) {
      reject(err);
    }

    const running = containers.find(container => container.Names.includes(name));

    resolve(running);
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

        console.log(`removing image ${repoTag} ${dockerImage.id || ''}`);
        await dockerImage.remove();
      }
    }
  }
};

test('ensure container gets started', async assert => {
  await compose.down({ cwd: path.join(__dirname), log: true });
  await compose.upAll({ cwd: path.join(__dirname), log: true });

  assert.true(await isContainerRunning('/compose_test_nginx'));
  assert.end();
});

test('ensure exit code is returned correctly', async assert => {
  assert.equal(0, (await compose.down({ cwd: path.join(__dirname), log: true })).exitCode);
  assert.equal(0, (await compose.upAll({ cwd: path.join(__dirname), log: true })).exitCode);
  assert.equal(1, (await compose.logs('non_existent_service', { cwd: path.join(__dirname) })).exitCode);
});

test('ensure container gets started with --build option', async assert => {
  await compose.down({ cwd: path.join(__dirname), log: true, config: 'docker-compose-build.yml' });
  await compose.upAll({ cwd: path.join(__dirname), log: true, config: 'docker-compose-build.yml', commandOptions: [ '--build' ]});

  assert.true(await isContainerRunning('/compose_test_nginx'));
  await compose.down({ cwd: path.join(__dirname), log: true, config: 'docker-compose-build.yml' });
  assert.end();
});

test('ensure container gets started with --build and --timeout option', async assert => {
  await compose.down({ cwd: path.join(__dirname), log: true, config: 'docker-compose-build.yml' });
  await compose.upAll({ cwd: path.join(__dirname), log: true, config: 'docker-compose-build.yml', commandOptions: [[ '--build' ], [ '--timeout', '5' ]]});

  assert.true(await isContainerRunning('/compose_test_nginx'));
  await compose.down({ cwd: path.join(__dirname), log: true, config: 'docker-compose-build.yml' });
  assert.end();
});

test('ensure container gets started with --build and --timeout option', async assert => {
  await compose.down({ cwd: path.join(__dirname), log: true, config: 'docker-compose-build.yml' });
  await compose.upAll({ cwd: path.join(__dirname), log: true, config: 'docker-compose-build.yml', commandOptions: [ '--build', [ '--timeout', '5' ]]});

  assert.true(await isContainerRunning('/compose_test_nginx'));
  await compose.down({ cwd: path.join(__dirname), log: true, config: 'docker-compose-build.yml' });
  assert.end();
});

test('ensure container command executed with --workdir command option', async assert => {
  await compose.down({ cwd: path.join(__dirname), log: true, config: 'docker-compose-42.yml' });

  assert.doesNotThrow(async () => {
    await compose.run('some-service', 'cat hello.txt', {
      cwd: path.join(__dirname),
      log: true,
      config: 'docker-compose-42.yml',
      composeOptions: [ '--verbose' ],
      commandOptions: [ '--workdir', '/mountedvolume/nested/dir' ]
    });
  });

  await compose.down({ cwd: path.join(__dirname), log: true, config: 'docker-compose-42.yml' });
  assert.end();
});

test('ensure only single container gets started', async assert => {
  await compose.down({ cwd: path.join(__dirname), log: true });
  await compose.upOne('alpine', { cwd: path.join(__dirname), log: true });

  assert.true(await isContainerRunning('/compose_test_alpine'));
  assert.false(await isContainerRunning('/compose_test_nginx'));
  assert.end();
});

test('ensure only multiple containers get started', async assert => {
  await compose.down({ cwd: path.join(__dirname), log: true });
  await compose.upMany([ 'alpine' ], { cwd: path.join(__dirname), log: true });

  assert.true(await isContainerRunning('/compose_test_alpine'));
  assert.false(await isContainerRunning('/compose_test_nginx'));
  assert.end();
});

test('ensure container gets down', async assert => {
  await compose.upAll({ cwd: path.join(__dirname), log: true });
  await compose.down({ cwd: path.join(__dirname), log: true });

  assert.false(await isContainerRunning('/compose_test_nginx'));
  assert.end();
});

test('ensure container gets stopped', async assert => {
  await compose.upAll({ cwd: path.join(__dirname), log: true });
  await compose.stop({ cwd: path.join(__dirname), log: true });

  assert.false(await isContainerRunning('/compose_test_nginx'));
  assert.end();
});

test('ensure container gets killed', async assert => {
  await compose.upAll({ cwd: path.join(__dirname), log: true });
  await compose.kill({ cwd: path.join(__dirname), log: true });

  assert.false(await isContainerRunning('/compose_test_nginx'));
  assert.end();
});

test('ensure custom ymls are working', async assert => {
  const config = './docker-compose-2.yml';
  const cwd = path.join(__dirname);
  const log = true;

  await compose.upAll({ cwd, log, config });
  assert.true(await isContainerRunning('/compose_test_nginx_2'));

  // config & [config] are the same thing, ensures that multiple configs are handled properly
  await compose.kill({ cwd, log, config: [ config ]});
  assert.false(await isContainerRunning('/compose_test_nginx_2'));
  assert.end();
});

test('ensure run and exec are working', async assert => {
  const checkOSID = (out, id) => {
    // parse /etc/os-release contents
    const re = /([\w,_]+)=(.*)/g;
    let match = null;
    const os = {};

    while ((match = re.exec(out)) !== null) { // eslint-disable-line no-cond-assign
      os[match[1]] = match[2];
    }

    assert.equals(os.ID, id);
  };

  const opts = { cwd: path.join(__dirname), log: false };

  await compose.upAll(opts);

  assert.true(await isContainerRunning('/compose_test_nginx'));

  let std = await compose.exec('db', 'cat /etc/os-release', opts);

  assert.false(std.err);
  checkOSID(std.out, 'debian');

  std = await compose.run('alpine', 'cat /etc/os-release', opts);
  assert.false(std.err);
  checkOSID(std.out, 'alpine');

  assert.end();
});

test('build single service', async assert => {
  const opts = {
    cwd: path.join(__dirname),
    log: false,
    config: 'docker-compose-build.yml'
  };

  await removeImagesStartingWith('compose-test-build-image');

  await compose.buildOne('build_test_1', opts);

  assert.true(await imageExists('compose-test-build-image-1:test'));
  assert.false(await imageExists('compose-test-build-image-2:test'));
  assert.false(await imageExists('compose-test-build-image-3:test'));
  assert.false(await imageExists('compose-test-build-image-4:test'));

  await removeImagesStartingWith('compose-test-build-image');

  assert.end();
});

test('build multiple services', async assert => {
  const opts = {
    cwd: path.join(__dirname),
    log: false,
    config: 'docker-compose-build.yml'
  };

  await compose.buildMany([ 'build_test_2', 'build_test_3' ], opts);

  assert.false(await imageExists('compose-test-build-image-1:test'));
  assert.true(await imageExists('compose-test-build-image-2:test'));
  assert.true(await imageExists('compose-test-build-image-3:test'));
  assert.false(await imageExists('compose-test-build-image-4:test'));

  await removeImagesStartingWith('compose-test-build-image');

  assert.end();
});

test('build all services', async assert => {
  const opts = {
    cwd: path.join(__dirname),
    log: false,
    config: 'docker-compose-build.yml'
  };

  await compose.buildAll(opts);

  assert.true(await imageExists('compose-test-build-image-1:test'));
  assert.true(await imageExists('compose-test-build-image-2:test'));
  assert.true(await imageExists('compose-test-build-image-3:test'));
  assert.true(await imageExists('compose-test-build-image-4:test'));

  await removeImagesStartingWith('compose-test-build-image');

  assert.end();
});

test('teardown', async assert => {
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

  assert.end();
});

test('config show data for docker-compose files', async assert => {
  const std = await compose.config({ cwd: path.join(__dirname), log: true, config: 'docker-compose-42.yml' });

  assert.false(std.err);
  assert.true(std.out.includes('some-service'));
  assert.true(std.out.includes('test/volume:/mountedvolume:rw'));
});

test('config show data for docker-compose files', async assert => {
  const std = await compose.configServices({ cwd: path.join(__dirname), log: true, config: 'docker-compose-42.yml' });

  assert.false(std.err);
  assert.true(std.out.includes('some-service'));
});

test('config show data for docker-compose files', async assert => {
  const std = await compose.configVolumes({ cwd: path.join(__dirname), log: true, config: 'docker-compose-42.yml' });

  assert.false(std.err);
  assert.true(std.out.includes('db-data'));
});

test('ps shows status data for started containers', async assert => {
  await compose.upAll({ cwd: path.join(__dirname), log: true });

  const std = await compose.ps({ cwd: path.join(__dirname), log: true });

  assert.false(std.err);
  assert.true(std.out.includes('compose_test_alpine'));
  assert.true(std.out.includes('compose_test_nginx'));

  assert.end();
});

test('ps does not show status data for stopped containers', async assert => {
  await compose.down({ cwd: path.join(__dirname), log: true });
  await compose.upOne('alpine', { cwd: path.join(__dirname), log: true });

  const std = await compose.ps({ cwd: path.join(__dirname), log: true });

  assert.false(std.err);
  assert.true(std.out.includes('compose_test_alpine'));
  assert.false(std.out.includes('compose_test_nginx'));

  assert.end();
});

test('restartAll does restart all containers', async assert => {
  await compose.upAll({ cwd: path.join(__dirname), log: true });
  await compose.restartAll({ cwd: path.join(__dirname), log: true });

  assert.true(await isContainerRunning('/compose_test_nginx'));
  assert.end();
});

test('restartMany does restart selected containers', async assert => {
  await compose.upAll({ cwd: path.join(__dirname), log: true });
  await compose.restartMany([ 'db', 'alpine' ], { cwd: path.join(__dirname), log: true });

  assert.true(await isContainerRunning('/compose_test_nginx'));
  assert.end();
});

test('restartOne does restart container', async assert => {
  await compose.upAll({ cwd: path.join(__dirname), log: true });
  await compose.restartOne('db', { cwd: path.join(__dirname), log: true });

  assert.true(await isContainerRunning('/compose_test_nginx'));
  assert.end();
});

test('logs does follow service logs', async assert => {
  await compose.upAll({ cwd: path.join(__dirname), log: true });
  await compose.logs('db', { cwd: path.join(__dirname), log: true });

  assert.true(await isContainerRunning('/compose_test_nginx'));
  assert.end();
});

test('returns the port for a started service', async assert => {
  const config = {
    cwd: path.join(__dirname),
    config: './docker-compose-2.yml'
  };

  await compose.upAll(config);
  const port = await compose.port('db', 5432, config);

  assert.true(port.out.match(/.*:[0-9]{1,5}/));
  assert.end();
});

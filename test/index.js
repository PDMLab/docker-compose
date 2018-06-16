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

test('ensure container gets started', async assert => {
  await compose.up({ cwd: path.join(__dirname), log: true });

  assert.true(await isContainerRunning('/compose_test_mongodb'));
  assert.end();
});

test('ensure container gets down', async assert => {
  await compose.up({ cwd: path.join(__dirname), log: true });
  await compose.down({ cwd: path.join(__dirname), log: true });

  assert.false(await isContainerRunning('/compose_test_mongodb'));
  assert.end();
});

test('ensure container gets stopped', async assert => {
  await compose.up({ cwd: path.join(__dirname), log: true });
  await compose.stop({ cwd: path.join(__dirname), log: true });

  assert.false(await isContainerRunning('/compose_test_mongodb'));
  assert.end();
});

test('ensure container gets killed', async assert => {
  await compose.up({ cwd: path.join(__dirname), log: true });
  await compose.kill({ cwd: path.join(__dirname), log: true });

  assert.false(await isContainerRunning('/compose_test_mongodb'));
  assert.end();
});

test('ensure custom ymls are working', async assert => {
  const config = './docker-compose-2.yml';
  const cwd = path.join(__dirname);
  const log = true;

  await compose.up({ cwd, log, config });
  assert.true(await isContainerRunning('/compose_test_alpine'));

   // config & [config] is the same thing, ensures that multiple configs are handled properly
  await compose.kill({ cwd, log, config: [ config ]});
  assert.false(await isContainerRunning('/compose_test_alpine'));
  assert.end();
});

test('teardown', assert => {
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

  assert.end();
});

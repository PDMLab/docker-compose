'use strict';

const compose = require('../index');
const path = require('path');
const tape = require('tape');
const _test = require('tape-promise').default;
const test = _test(tape);
const Docker = require('dockerode');
const docker = new Docker();

test('ensure container gets started', async assert => {
  await compose.up({ cwd: path.join(__dirname), log: true });

  docker.listContainers((err, containers) => {
    const containerIsRunning = containers.find(container =>
      container.Names.includes('/compose_test_mongodb')
    );

    assert.true(containerIsRunning);
    assert.end();
  });
});

test('ensure container gets down', async assert => {
  await compose.up({ cwd: path.join(__dirname), log: true });
  await compose.down({ cwd: path.join(__dirname), log: true });

  docker.listContainers((err, containers) => {
    // eslint-disable-line
    const containerIsRunning = containers.find(container =>
      container.Names.includes('/compose_test_mongodb')
    );

    assert.false(containerIsRunning);
    assert.end();
  });
});

test('ensure container gets stopped', async assert => {
  await compose.up({ cwd: path.join(__dirname), log: true });
  await compose.stop({ cwd: path.join(__dirname), log: true });

  docker.listContainers((err, containers) => {
    // eslint-disable-line
    const containerIsRunning = containers.find(container =>
      container.Names.includes('/compose_test_mongodb')
    );

    assert.false(containerIsRunning);
    assert.end();
  });
});

test('ensure container gets killed', async assert => {
  await compose.up({ cwd: path.join(__dirname), log: true });
  await compose.kill({ cwd: path.join(__dirname), log: true });

  docker.listContainers((err, containers) => {
    // eslint-disable-line
    const containerIsRunning = containers.find(container =>
      container.Names.includes('/compose_test_mongodb')
    );

    assert.false(containerIsRunning);
    assert.end();
  });
});

test('teardown', assert => {
  docker.listContainers((err, containers) => {
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

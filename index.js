'use strict';

const promisify = require('es6-promisify');
const exec = promisify(require('child_process').exec, { multiArgs: true });
const logger = require('./lib/log');

const logStandards = function (standards) {
  const stdout = standards.stdout || standards[0];

  if (stdout && stdout.length > 0) {
    logger.info(stdout);
  }

  const stderr = standards.stderr || standards[1];

  if (stderr) {
    logger.warn(stderr);
  }
};

/**
 * @param {object} options
 * @param {boolean} [options.log]
 * @param {string} options.cwd
 */
const up = function (options) {
  return new Promise((resolve, reject) => {
    const cwd = options.cwd;

    exec('docker-compose up -d', { cwd }).then(
      standards => {
        if (options.log) {
          logStandards(standards);
        }

        return resolve();
      },
      err => {
        logger.error(err.message);

        return reject(err);
      }
    );
  });
};

/**
 * @param {object} options
 * @param {boolean} [options.log]
 * @param {string} options.cwd
 */
const down = function (options) {
  return new Promise((resolve, reject) => {
    const cwd = options.cwd;

    exec('docker-compose down', { cwd }).then(
      standards => {
        if (options.log) {
          logStandards(standards);
        }

        return resolve();
      },
      err => {
        logger.error(err.message);

        return reject(err);
      }
    );
  });
};

/**
 * @param {object} options
 * @param {boolean} [options.log]
 * @param {cwd} options.cwd
 */
const stop = function (options) {
  return new Promise((resolve, reject) => {
    const cwd = options.cwd;

    exec('docker-compose stop', { cwd }).then(
      standards => {
        if (options.log) {
          logStandards(standards);
        }

        return resolve();
      },
      err => {
        logger.error(err.message);

        return reject(err);
      }
    );
  });
};

/**
 * @param {object} options
 * @param {boolean} [options.log]
 * @param {string} options.cwd
 */
const kill = function (options) {
  return new Promise((resolve, reject) => {
    const cwd = options.cwd;

    exec('docker-compose kill', { cwd }).then(
      standards => {
        if (options.log) {
          logStandards(standards);
        }

        return resolve();
      },
      err => {
        logger.error(err.message);

        return reject(err);
      }
    );
  });
};

/**
 * @param {object} options
 * @param {boolean} [options.log]
 * @param {string} options.cwd
 */
const rm = function (options) {
  return new Promise((resolve, reject) => {
    const cwd = options.cwd;

    exec('docker-compose rm -f', { cwd }).then(
      standards => {
        if (options.log) {
          logStandards(standards);
        }

        return resolve();
      },
      err => {
        logger.error(err.message);

        return reject(err);
      }
    );
  });
};

module.exports = { up, kill, down, stop, rm };

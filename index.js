'use strict';

const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const logger = require('./lib/log');

const logStandards = function (standards) {
  if (standards.stdout.length > 0) {
    logger.info(standards.stdout);
  }

  if (standards.stderr) {
    logger.warn(standards.stderr);
  }
};

/**
 * @param {object} options
 * @param {boolean} options.log
 * @param {cwd} options.cwd
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
 * @param {boolean} options.log
 * @param {cwd} options.cwd
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
 * @param {boolean} options.log
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
 * @param {boolean} options.log
 * @param {cwd} options.cwd
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
 * @param {boolean} options.log
 * @param {cwd} options.cwd
 */
const rm = function (options) {
  const cwd = options.cwd;

  exec('docker-compose rm', { cwd }).then(
    standards => {
      if (options.log) {
        logStandards(standards);
      }
    },
    err => {
      logger.error(err.message);
    }
  );
};

module.exports = { up, kill, down, stop, rm };

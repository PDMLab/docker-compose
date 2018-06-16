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
 * Converts supplied yml files to cli arguments
 * https://docs.docker.com/compose/reference/overview/#use--f-to-specify-name-and-path-of-one-or-more-compose-files
 * @param {?(string|string[])} config
 */
const configToArgs = config => {
  if (typeof config === 'undefined') {
    return '';
  } else if (typeof config === 'string') {
    return `-f ${config}`;
  } else if (config instanceof Array) {
    return config.map(configToArgs).join(' ');
  }
  throw new Error(`Invalid argument supplied: ${config}`);
};

/**
 * Executes docker-compose command with common options
 * @param {string} command
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 */
const execCompose = (command, options) => new Promise((resolve, reject) => {
  const cmd = `docker-compose ${configToArgs(options.config)} ${command}`;
  const cwd = options.cwd;

  exec(cmd, { cwd }).then(
      standards => {
        if (options.log) {
          logStandards(standards);
        }

        resolve();
      },
      error => {
        logger.error(error.message);

        return reject(error);
      }
    );
});

/**
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 */
const up = function (options) {
  return execCompose('up -d', options);
};

/**
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 */
const down = function (options) {
  return execCompose('down', options);
};

/**
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 */
const stop = function (options) {
  return execCompose('stop', options);
};

/**
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 */
const kill = function (options) {
  return execCompose('kill', options);
};

/**
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 */
const rm = function (options) {
  return execCompose('rm -f', options);
};

module.exports = { up, kill, down, stop, rm };

'use strict';

const promisify = require('es6-promisify');
const execute = promisify(require('child_process').exec, { multiArgs: true });
const logger = require('./lib/log');

const logStandards = function (std) {
  if (std.out && std.out.length > 0) {
    logger.info(std.out);
  }

  if (std.err && std.err.length > 0) {
    logger.warn(std.err);
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
 * @param {?object} [options.env]
 */
const execCompose = (command, options) => new Promise((resolve, reject) => {
  const cmd = `docker-compose ${configToArgs(options.config)} ${command}`;
  const cwd = options.cwd;
  const env = options.env || null;

  execute(cmd, { cwd, env }).then(
      standards => {
        const std = {
          out: standards[0],
          err: standards[1]
        };

        if (options.log) {
          logStandards(std);
        }

        resolve(std);
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
 * @param {?object} [options.env]
 */
const up = function (options) {
  return execCompose('up -d', options);
};

/**
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 */
const down = function (options) {
  return execCompose('down', options);
};

/**
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 */
const stop = function (options) {
  return execCompose('stop', options);
};

/**
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 */
const kill = function (options) {
  return execCompose('kill', options);
};

/**
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 */
const rm = function (options) {
  return execCompose('rm -f', options);
};

/**
 * Execute command in a running container
 * @param {string} contaier container name
 * @param {string} command command to execute
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 *
 * @return {object} std.out / std.err
 */
const exec = function (container, command, options) {
  return execCompose(`exec -T ${container} ${command}`, options);
};

/**
 * Run command
 * @param {string} contaier container name
 * @param {string} command command to execute
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 *
 * @return {object} std.out / std.err
 */
const run = function (container, command, options) {
  return execCompose(`run -T ${container} ${command}`, options);
};

module.exports = { up, kill, down, stop, rm, exec, run };

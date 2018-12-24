'use strict';

const childProcess = require('child_process');

/**
 * Converts supplied yml files to cli arguments
 * https://docs.docker.com/compose/reference/overview/#use--f-to-specify-name-and-path-of-one-or-more-compose-files
 * @param {?(string|string[])} config
 */
const configToArgs = config => {
  if (typeof config === 'undefined') {
    return [];
  } else if (typeof config === 'string') {
    return [ '-f', config ];
  } else if (config instanceof Array) {
    return config.reduce((args, item) => args.concat([ '-f', item ]), []);
  }
  throw new Error(`Invalid argument supplied: ${config}`);
};

/**
 * Executes docker-compose command with common options
 * @param {string} command
 * @param {string[]} args
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 */
const execCompose = (command, args, options) => new Promise((resolve, reject) => {
  const composeArgs = configToArgs(options.config).concat([ command ], args);
  const cwd = options.cwd;
  const env = options.env || null;

  const childProc = childProcess.spawn('docker-compose', composeArgs, { cwd, env });

  childProc.on('error', err => {
    reject(err);
  });

  const result = {
    err: '',
    out: ''
  };

  childProc.stdout.on('data', chunk => {
    result.out += chunk.toString();
  });

  childProc.stderr.on('data', chunk => {
    result.err += chunk.toString();
  });

  childProc.on('close', () => {
    resolve(result);
  });

  if (options.log) {
    childProc.stdout.pipe(process.stdout);
    childProc.stderr.pipe(process.stderr);
  }
});

/**
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 */
const upAll = function (options) {
  return execCompose('up', [ '-d' ], options);
};

/**
 * @param {string[]} services
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 */
const upMany = function (services, options) {
  return execCompose('up', [ '-d' ].concat(services), options);
};

/**
 * @param {string} service
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 */
const upOne = function (service, options) {
  return execCompose('up', [ '-d', service ], options);
};

/**
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 */
const down = function (options) {
  return execCompose('down', [], options);
};

/**
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 */
const stop = function (options) {
  return execCompose('stop', [], options);
};

/**
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 */
const kill = function (options) {
  return execCompose('kill', [], options);
};

/**
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 */
const rm = function (options) {
  return execCompose('rm', [ '-f' ], options);
};

/**
 * Execute command in a running container
 * @param {string} container container name
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
  const args = command.split(/\s+/);

  return execCompose('exec', [ '-T', container ].concat(args), options);
};

/**
 * Run command
 * @param {string} container container name
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
  const args = command.split(/\s+/);

  return execCompose('run', [ '-T', container ].concat(args), options);
};

/**
 * Build command
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 *
 * @return {object} std.out / std.err
 */
const buildAll = function (options) {
  return execCompose('build', [], options);
};

/**
 * Build command
 * @param {string[]} services list of service names
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 *
 * @return {object} std.out / std.err
 */
const buildMany = function (services, options) {
  return execCompose('build', services, options);
};

/**
 * Build command
 * @param {string} service service name
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 *
 * @return {object} std.out / std.err
 */
const buildOne = function (service, options) {
  return execCompose('build', [ service ], options);
};

module.exports = { upAll, upMany, upOne, kill, down, stop, rm, exec, run, buildAll, buildMany, buildOne };

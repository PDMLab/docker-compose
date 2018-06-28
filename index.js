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
  const composeArgs = configToArgs(options.config);
  const cwd = options.cwd;
  const env = options.env || null;

  const childProc = childProcess.spawn('docker-compose', composeArgs.concat([ command ], args), { cwd, env }, (err, stdout, stderr) => {
    if (err) {
      reject(err);
    } else {
      resolve({
        err: stderr,
        out: stdout
      });
    }
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
const up = function (options) {
  return execCompose('up', [ '-d' ], options);
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
  return execCompose('exec', [ '-T', container, command ], options);
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
  return execCompose('run', [ '-T', container, command ], options);
};

module.exports = { up, kill, down, stop, rm, exec, run };

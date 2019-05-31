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
 * Converts docker-compose commandline options to cli arguments
 * @param {string[]|Array<string|string[]>} composeOptions
 * @return {Array}
 */
const composeOptionsToArgs = function (composeOptions) {
  let composeArgs = [];

  composeOptions.forEach(option => {
    if (option instanceof Array) {
      composeArgs = composeArgs.concat(option);
    }
    if (typeof option === 'string') {
      composeArgs = composeArgs.concat([ option ]);
    }
  });

  return composeArgs;
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
 * @param {?(string[]|Array<string|string[]>)} [options.commandOptions]
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
 */
const execCompose = (command, args, options) => new Promise((resolve, reject) => {
  const composeOptions = options.composeOptions || [];
  const commandOptions = options.commandOptions || [];
  let composeArgs = composeOptionsToArgs(composeOptions);

  composeArgs = composeArgs.concat(configToArgs(options.config).concat([ command ].concat(composeOptionsToArgs(commandOptions), args)));

  const cwd = options.cwd;
  const env = options.env || null;

  const childProc = childProcess.spawn('docker-compose', composeArgs, { cwd, env });

  childProc.on('error', err => {
    reject(err);
  });

  const result = {
    exitCode: null,
    err: '',
    out: ''
  };

  childProc.stdout.on('data', chunk => {
    result.out += chunk.toString();
  });

  childProc.stderr.on('data', chunk => {
    result.err += chunk.toString();
  });

  childProc.on('exit', exitCode => {
    result.exitCode = exitCode;
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
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
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
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
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
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
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
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
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
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
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
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
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
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
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
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
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
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
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
 * @param {?boolean} [options.parallel]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
 *
 * @return {object} std.out / std.err
 */
const buildAll = function (options) {
  return execCompose(
    'build',
    options.parallel ? [ '--parallel' ] : [],
    options
  );
};

/**
 * Build command
 * @param {string[]} services list of service names
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?boolean} [options.parallel]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 *
 * @return {object} std.out / std.err
 */
const buildMany = function (services, options) {
  return execCompose(
    'build',
    options.parallel ? [ '--parallel' ].concat(services) : services,
    options
  );
};

/**
 * Build command
 * @param {string} service service name
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
 *
 * @return {object} std.out / std.err
 */
const buildOne = function (service, options) {
  return execCompose('build', [ service ], options);
};

/**
 * Config command
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
 *
 * @return {object} std.out / std.err
 */
const config = function (options) {
  return execCompose('config', [], options);
};

/**
 * Config command with --services option
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
 *
 * @return {object} std.out / std.err
 */
const configServices = function (options) {
  return execCompose('config', [ '--services' ], options);
};

/**
 * Config command with --volumes option
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
 *
 * @return {object} std.out / std.err
 */
const configVolumes = function (options) {
  return execCompose('config', [ '--volumes' ], options);
};

/**
 * Ps command
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
 */
const ps = function (options) {
  return execCompose('ps', [], options);
};

/**
 * Push command
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?boolean} options.ignorePushFailures
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
 */
const push = function (options) {
  return execCompose(
    'push',
    options.ignorePushFailures ? [ '--ignore-push-failures' ] : [],
    options
  );
};

/**
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
 */
const restartAll = function (options) {
  return execCompose('restart', [], options);
};

/**
 * @param {string[]} services
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
 */
const restartMany = function (services, options) {
  return execCompose('restart', services, options);
};

/**
 * @param {string} service
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
 */
const restartOne = function (service, options) {
  return restartMany([ service ], options);
};

/**
 * @param {?(string|string[])} services
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {boolean} [options.follow]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
 */
const logs = function (services, options) {
  let args = Array.isArray(services) ? services : [ services ];

  if (options.follow) {
    args = [ '--follow', ...args ];
  }

  return execCompose('logs', args, options);
};

/**
 * @param {string} service
 * @param {string|number} containerPort
 * @param {object} options
 * @param {string} options.cwd
 * @param {boolean} [options.log]
 * @param {?(string|string[])} [options.config]
 * @param {?object} [options.env]
 * @param {?(string[]|Array<string|string[]>)} [options.composeOptions]
 */
const port = function (service, containerPort, options) {
  const args = [ service, containerPort ];

  return execCompose('port', args, options);
};

module.exports = {
  upAll,
  upMany,
  upOne,
  kill,
  down,
  stop,
  rm,
  exec,
  logs,
  restartAll,
  restartMany,
  restartOne,
  run,
  buildAll,
  buildMany,
  buildOne,
  ps,
  config,
  configServices,
  configVolumes,
  push,
  port
};

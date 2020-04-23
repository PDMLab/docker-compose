import childProcess from 'child_process';

export interface IDockerComposeOptions {
  cwd?: string;
  config?: string | string[];
  log?: boolean;
  composeOptions?: string[] | (string | string[])[];
  commandOptions?: string[] | (string | string[])[];
  env?: NodeJS.ProcessEnv;
}

export interface IDockerComposeLogOptions extends IDockerComposeOptions {
  follow?: boolean;
}

export interface IDockerComposeBuildOptions extends IDockerComposeOptions {
  parallel?: boolean;
}

export interface IDockerComposePushOptions extends IDockerComposeOptions {
  ignorePushFailures?: boolean;
}

export interface IDockerComposeResult {
  exitCode: number | null;
  out: string;
  err: string;
}

/**
 * Converts supplied yml files to cli arguments
 * https://docs.docker.com/compose/reference/overview/#use--f-to-specify-name-and-path-of-one-or-more-compose-files
 */
const configToArgs = (config): string[] => {
  if (typeof config === 'undefined') {
    return [];
  } else if (typeof config === 'string') {
    return [ '-f', config ];
  } else if (config instanceof Array) {
    return config.reduce((args, item): string[] => args.concat([ '-f', item ]), []);
  }
  throw new Error(`Invalid argument supplied: ${config}`);
};

/**
 * Converts docker-compose commandline options to cli arguments
 */
const composeOptionsToArgs = (composeOptions): string[] => {
  let composeArgs: string[] = [];

  composeOptions.forEach((option: string[] | string): void => {
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
 */
const execCompose = (command, args, options: IDockerComposeOptions = {}): Promise<IDockerComposeResult> => new Promise((resolve, reject): void => {
  const composeOptions = options.composeOptions || [];
  const commandOptions = options.commandOptions || [];
  let composeArgs = composeOptionsToArgs(composeOptions);

  composeArgs = composeArgs.concat(configToArgs(options.config).concat([ command ].concat(composeOptionsToArgs(commandOptions), args)));

  const cwd = options.cwd;
  const env = options.env || undefined;

  const childProc = childProcess.spawn('docker-compose', composeArgs, { cwd, env });

  childProc.on('error', (err): void => {
    reject(err);
  });

  const result: IDockerComposeResult = {
    exitCode: null,
    err: '',
    out: ''
  };

  childProc.stdout.on('data', (chunk): void => {
    result.out += chunk.toString();
  });

  childProc.stderr.on('data', (chunk): void => {
    result.err += chunk.toString();
  });

  childProc.on('exit', (exitCode): void => {
    result.exitCode = exitCode;
    if (exitCode === 0) {
      resolve(result);
    } else {
      reject(result);
    }
  });

  if (options.log) {
    childProc.stdout.pipe(process.stdout);
    childProc.stderr.pipe(process.stderr);
  }
});

/**
 * Determines whether or not to use the default non-interactive flag -d for up commands
 */
const shouldUseDefaultNonInteractiveFlag = function(options: IDockerComposeOptions = {}): boolean {
  const commandOptions = options.commandOptions || [];
  const containsOtherNonInteractiveFlag = commandOptions.reduce((memo: boolean, item: string | string[]) => {
    return memo && !item.includes('--abort-on-container-exit');
  }, true);
  return containsOtherNonInteractiveFlag;
};

export const upAll = function (options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  const args = shouldUseDefaultNonInteractiveFlag(options) ? [ '-d' ] : [];
  return execCompose('up', args, options);
};

export const upMany = function (services: string[], options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  const args = shouldUseDefaultNonInteractiveFlag(options) ? [ '-d' ].concat(services) : services;
  return execCompose('up', args, options);
};

export const upOne = function (service: string, options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  const args = shouldUseDefaultNonInteractiveFlag(options) ? [ '-d', service ] : [ service ];
  return execCompose('up', args, options);
};

export const down = function (options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  return execCompose('down', [], options);
};

export const stop = function (options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  return execCompose('stop', [], options);
};

export const stopOne = function (service: string, options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  return execCompose('stop', [ service ], options);
};

export const kill = function (options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  return execCompose('kill', [], options);
};

export const rm = function (options?: IDockerComposeOptions, ...services: string[]): Promise<IDockerComposeResult> {
  return execCompose('rm', [ '-f', ...services ], options);
};

export const exec = function (container: string, command: string | string[], options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  const args = Array.isArray(command) ? command : command.split(/\s+/);

  return execCompose('exec', [ '-T', container ].concat(args), options);
};

export const run = function (container: string, command: string | string[], options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  const args = Array.isArray(command) ? command : command.split(/\s+/);

  return execCompose('run', [ '-T', container ].concat(args), options);
};

export const buildAll = function (options: IDockerComposeBuildOptions = {}): Promise<IDockerComposeResult> {
  return execCompose(
    'build',
    options.parallel ? [ '--parallel' ] : [],
    options
  );
};

export const buildMany = function (services: string[], options: IDockerComposeBuildOptions = {}): Promise<IDockerComposeResult> {
  return execCompose(
    'build',
    options.parallel ? [ '--parallel' ].concat(services) : services,
    options
  );
};

export const buildOne = function (service: string, options?: IDockerComposeBuildOptions): Promise<IDockerComposeResult> {
  return execCompose('build', [ service ], options);
};

export const pullAll = function (options: IDockerComposeOptions = {}): Promise<IDockerComposeResult> {
  return execCompose('pull', [], options);
};

export const pullMany = function (services: string[], options: IDockerComposeOptions = {}): Promise<IDockerComposeResult> {
  return execCompose('pull', services, options);
};

export const pullOne = function (service: string, options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  return execCompose('pull', [ service ], options);
};

export const config = function (options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  return execCompose('config', [], options);
};

export const configServices = function (options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  return execCompose('config', [ '--services' ], options);
};

export const configVolumes = function (options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  return execCompose('config', [ '--volumes' ], options);
};

export const ps = function (options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  return execCompose('ps', [], options);
};

export const push = function (options: IDockerComposePushOptions = {}): Promise<IDockerComposeResult> {
  return execCompose(
    'push',
    options.ignorePushFailures ? [ '--ignore-push-failures' ] : [],
    options
  );
};

export const restartAll = function (options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  return execCompose('restart', [], options);
};

export const restartMany = function (services: string[], options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  return execCompose('restart', services, options);
};

export const restartOne = function (service: string, options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  return restartMany([ service ], options);
};

export const logs = function (services: string | string[], options: IDockerComposeLogOptions = {}): Promise<IDockerComposeResult> {
  let args = Array.isArray(services) ? services : [ services ];

  if (options.follow) {
    args = [ '--follow', ...args ];
  }

  return execCompose('logs', args, options);
};

export const port = function (service: string, containerPort: string | number, options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  const args = [ service, containerPort ];

  return execCompose('port', args, options);
};

export const version = function (options?: IDockerComposeOptions): Promise<IDockerComposeResult> {
  return execCompose('version', [ '--short' ], options);
};

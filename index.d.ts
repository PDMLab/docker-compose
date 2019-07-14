export declare const upAll: (options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

export declare const upMany: (services: string[], options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

export declare const upOne: (service: string, options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

export declare const kill: (options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

export declare const down: (options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

export declare const stop: (options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

export declare const restartAll: (options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

export declare const restartMany: (services: string[], options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

export declare const restartOne: (service: string, options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

export declare const rm: (options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

export declare const exec: (container: string, command: string | string[], options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

export declare const logs: (services: string | string[], options?: IDockerComposeLogOptions) => Promise<IDockerComposeResult>;

export declare const run: (container: string, command: string | string[], options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

export declare const buildAll: (options?: IDockerComposeBuildOptions) => Promise<IDockerComposeResult>;

export declare const buildMany: (services: string[], options?: IDockerComposeBuildOptions) => Promise<IDockerComposeResult>;

export declare const buildOne: (service: string, options?: IDockerComposeBuildOptions | undefined) => Promise<IDockerComposeResult>;

export declare const config: (options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

export declare const configServices: (options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

export declare const configVolumes: (options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

export declare const ps: (options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

export declare const push: (options?: IDockerComposePushOptions) => Promise<IDockerComposeResult>;

export declare const port: (service: string, containerPort: string | number, options?: IDockerComposeOptions | undefined) => Promise<IDockerComposeResult>;

interface IDockerComposeOptions {
  cwd?: string;
  config?: string | string[];
  log?: boolean;
  composeOptions?: string[] | (string | string[])[];
  commandOptions?: string[] | (string | string[])[];
  env?: string;
}

interface IDockerComposeLogOptions extends IDockerComposeOptions {
  follow?: boolean;
}

interface IDockerComposeBuildOptions extends IDockerComposeOptions {
  parallel?: boolean;
}

interface IDockerComposePushOptions extends IDockerComposeOptions {
  ignorePushFailures?: boolean;
}

interface IDockerComposeResult {
  exitCode: number | null;
  out: string;
  err: string;
}

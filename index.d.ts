export declare function upAll(options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function upMany(services: String[], options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function upOne(service: String, options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function kill(options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function down(options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function stop(options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function restartAll(options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function restartMany(services: String[], options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function restartOne(service: String, options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function rm(options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function exec(container: String, command: String, options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function logs(services: String[], options: IDockerComposeLogOptions): Promise<IDockerComposeResult>;

export declare function run(service: String, command: String, options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function buildAll(options: IDockerComposeBuildOptions): Promise<IDockerComposeResult>;

export declare function buildMany(services: String[], options: IDockerComposeBuildOptions): Promise<IDockerComposeResult>;

export declare function buildOne(service: String, options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function config(options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function configServices(options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function configVolumes(options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function ps(options: IDockerComposeOptions): Promise<IDockerComposeResult>;

export declare function push(options: IDockerComposePushOptions): Promise<IDockerComposeResult>;

export declare function port(service: String, containerPort: String | Number, options: IDockerComposeOptions): Promise<IDockerComposeResult>;

interface IDockerComposeOptions {
    cwd: string;
    config?: string | string[];
    log?: boolean;
    composeOptions?: string[] | Array<string | string[]>;
    commandOptions?: string[] | Array<string | string[]>;
}

interface IDockerComposeLogOptions extends IDockerComposeOptions {
    follow: boolean;
}

interface IDockerComposeBuildOptions extends IDockerComposeOptions {
    parallel?: boolean;
}

interface IDockerComposePushOptions extends IDockerComposeOptions {
    ignorePushFailures?: boolean;
}

interface IDockerComposeResult {
    exitCode?: number;
    out: string;
    err: string;
}

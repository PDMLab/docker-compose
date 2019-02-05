declare module "docker-compose" {
  interface IDockerCompose {
    upAll(options: IDockerComposeOptions): Promise<IDockerComposeResult>;
    upMany(services:String[], options: IDockerComposeOptions): Promise<IDockerComposeResult>;
    upOne(service:String, options: IDockerComposeOptions): Promise<IDockerComposeResult>;
    kill(options: IDockerComposeOptions): Promise<IDockerComposeResult>;
    down(options: IDockerComposeOptions): Promise<IDockerComposeResult>;
    stop(options: IDockerComposeOptions): Promise<IDockerComposeResult>;
    restartAll(options: IDockerComposeOptions): Promise<IDockerComposeResult>;
    restartMany(services:String[], options: IDockerComposeOptions): Promise<IDockerComposeResult>;
    restartOne(service:String, options: IDockerComposeOptions): Promise<IDockerComposeResult>;
    rm(options: IDockerComposeOptions): Promise<IDockerComposeResult>;
    exec(container:String, command:String, options: IDockerComposeOptions): Promise<IDockerComposeResult>;
    logs(container:String, command:String, options: IDockerComposeLogOptions): Promise<IDockerComposeResult>;
    run(service:String, command:String, options: IDockerComposeOptions): Promise<IDockerComposeResult>;
    buildAll(options: IDockerComposeOptions): Promise<IDockerComposeResult>;
    buildMany(services:String[], options: IDockerComposeOptions): Promise<IDockerComposeResult>;
    buildOne(service:String, options: IDockerComposeOptions): Promise<IDockerComposeResult>;
    ps(options: IDockerComposeOptions): Promise<IDockerComposeResult>;
  }

  interface IDockerComposeOptions {
    cwd: string;
    config?: string | string[];
    log?: boolean;
  }

  interface IDockerComposeLogOptions extends IDockerComposeOptions{
    follow: boolean;
  }

  interface IDockerComposeResult {
    out: string;
    err: string;
  }

  const _: IDockerCompose;
  export = _;
}

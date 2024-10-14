import dockerCliJs from 'docker-cli-js';

const IS_DOCKER_ACTIVE_COMMAND: string = `info`;
const IS_DOCKER_INSTALLED_COMMAND: string = `--version`;

const DockerCli = new dockerCliJs.Docker({ echo: false });

const Docker = {
  isActive: (callback: (err: string | null, isActive: boolean) => void) => {
    DockerCli.command(IS_DOCKER_ACTIVE_COMMAND, err => {
      if (err)
        return callback(null, false);

      return callback(null, true);
    });
  },
  isInstalled: (callback: (err: string | null, isInstalled: boolean) => void) => {
    DockerCli.command(IS_DOCKER_INSTALLED_COMMAND, err => {
      if (err)
        return callback(null, false);

      return callback(null, true);
    });
  }
};

export default Docker;

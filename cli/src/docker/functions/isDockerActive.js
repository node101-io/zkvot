import dockerCLI from 'docker-cli-js';

const IS_DOCKER_ACTIVE_COMMAND = `info`;

const Docker = new dockerCLI.Docker({
  echo: false
});

export default callback => {
  Docker.command(
    IS_DOCKER_ACTIVE_COMMAND,
    err => {
      if (err)
        return callback(null, false);

      return callback(null, true);
    }
  );
};
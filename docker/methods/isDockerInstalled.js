const dockerCLI = require('docker-cli-js');

const Docker = new dockerCLI.Docker({
  echo: false
});

const IS_DOCKER_INSTALLED_COMMAND = `--version`;

/**
 * @callback isDockerInstalledCallback
 * @param {boolean} isInstalled
 */

/**
 * @param {isDockerInstalledCallback} callback
 * @returns {void}
 */
module.exports = callback => {
  Docker.command(
    IS_DOCKER_INSTALLED_COMMAND,
    err => {
      if (err)
        return callback(false);

      return callback(true);
    }
  );
};
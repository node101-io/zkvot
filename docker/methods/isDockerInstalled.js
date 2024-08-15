const dockerCLI = require('docker-cli-js');

const Docker = new dockerCLI.Docker({
  echo: false
});

const IS_DOCKER_INSTALLED_COMMAND = `--version`;

/**
 * @callback isDockerInstalledCallback
 * @param {string|null} err
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
        return callback(null, false);

      return callback(null, true);
    }
  );
};
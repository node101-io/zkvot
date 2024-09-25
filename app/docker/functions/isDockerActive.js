const dockerCLI = require('docker-cli-js');

const Docker = new dockerCLI.Docker({
  echo: false
});

const IS_DOCKER_ACTIVE_COMMAND = `info`;

/**
 * @callback isDockerActiveCallback
 * @param {string|null} err
 * @param {boolean} isActive
 */

/**
 * @param {isDockerActiveCallback} callback
 * @returns {void}
 */
module.exports = callback => {
  Docker.command(
    IS_DOCKER_ACTIVE_COMMAND,
    err => {
      if (err)
        return callback(null, false);

      return callback(null, true);
    }
  );
};
const childProcess = require('child_process');

const SUPPORTED_PLATFORMS = [ 'darwin', 'linux' ];
const ACTIVATE_DOCKER_COMMAND_DARWIN = `
  open /Applications/Docker.app &> /dev/null
  echo $?
`;

/**
 * @callback activateDockerCallback
 * @param {string|null} err
 */

/**
 * @param {string} platform
 * @param {activateDockerCallback} callback
 * @returns {void}
 */
module.exports = (platform, callback) => {
  if (!platform || typeof platform != 'string' || !platform.trim().length || !SUPPORTED_PLATFORMS.includes(platform))
    return callback('bad_request');

  if (platform == 'linux') {
    return callback('function_not_available');
  } else if (platform == 'darwin') {
    childProcess.exec(
      ACTIVATE_DOCKER_COMMAND_DARWIN,
      (err, stdout) => {
        if (err)
          return callback('terminal_error');

        if (isNaN(stdout) || stdout != 0)
          return callback('process_error');

        return callback(null);
      }
    );
  };
};
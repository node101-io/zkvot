const childProcess = require('child_process');

const activateDockerCommand = require('../commands/activate-docker/darwin/command');

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
  if (!platform || typeof platform != 'string' || !platform.trim().length)
    return callback('bad_request');

  if (platform == 'darwin') {
    childProcess
      .exec(activateDockerCommand(), (err, stdout, stderr) => {
        if (err)
          return callback('unknown_error');

        if (!stdout || stdout != 0)
          return callback('docker_activate_failed');

        return callback(null);
      });
  };
};
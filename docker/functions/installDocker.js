const childProcess = require('child_process');

const isBrewInstalled = require('./isBrewInstalled');

const installDockerCommand = require('../commands/installDocker/darwin');

/**
 * @callback installDockerCallback
 * @param {string|null} error
 * @param {boolean} installed
 */

/**
 * @param {string} platform
 * @param {installDockerCallback} callback
 * @returns {void}
 */
module.exports = (platform, callback) => {
  if (!platform || typeof platform != 'string' || !platform.trim().length)
    return callback('bad_request');

  if (platform == 'darwin') {
    isBrewInstalled((err, installed) => {
      if (err)
        return callback(err);

      if (!installed)
        return callback(null, false); // Will install brew

      childProcess
        .exec(installDockerCommand(), (err, stdout, stderr) => {
          if (err)
            return callback('unknown_error');

          if (!stdout || stdout != 0)
            return callback('docker_install_failed');

          return callback(null);
        });
    });
  };
};
const childProcess = require('child_process');

const installBrew = require('./installBrew');
const isBrewInstalled = require('./isBrewInstalled');

const installDockerCommand = require('../commands/install-docker/darwin/command');

/**
 * @callback installDockerCallback
 * @param {string|null} err
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

      if (!installed) {
        installBrew(err => {
          if (err)
            return callback(err);

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
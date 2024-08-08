const childProcess = require('child_process');

const installBrewCommand = require('../commands/install-brew/command');

/**
 * @callback installBrewCallback
 * @param {string|null} err
 * @returns {void}
 */
module.exports = callback => {
  childProcess
    .exec(installBrewCommand(), (err, stdout, stderr) => {
      if (err)
        return callback('unknown_error');

      if (!stdout || stdout != 0)
        return callback('brew_install_failed');

      return callback(null);
    });
};
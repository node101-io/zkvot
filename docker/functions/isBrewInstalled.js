const childProcess = require('child_process');

const isBrewInstalledCommand = require('../commands/is-brew-installed/command');

/**
 * @callback isBrewInstalledCallback
 * @param {string|null} err
 * @param {boolean|null} installed
 */
module.exports = callback => {
  childProcess
    .exec(isBrewInstalledCommand(), (err, stdout, stderr) => {
      if (err)
        return callback('unknown_error');

      if (!stdout || stdout != 0)
        return callback(null, false);

      return callback(null, true);
    });
};
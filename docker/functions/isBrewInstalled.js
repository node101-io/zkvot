const childProcess = require('child_process');

const isBrewInstalledCommand = require('../commands/isBrewInstalled');

/**
 * @callback isBrewInstalledCallback
 * @param {Error|null} err
 * @param {boolean} installed
 */
module.exports = callback => {
  childProcess
    .exec(isBrewInstalledCommand(), (err, stdout, stderr) => {
      if (err)
        return callback(err);

      if (!stdout || stdout != 0)
        return callback(null, false);

      return callback(null, true);
    });
};
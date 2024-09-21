const { app } = require('electron');
const childProcess = require('child_process');
const path = require('path');

const celestiaDockerFolderPath = path.join(app.getPath('userData'), 'zkvote-node/celestia');

const UNINSTALL_LIGHT_NODE_COMMAND = 'docker compose down --volumes --rmi all';

/**
 * @callback uninstallCelestiaCallback
 * @param {string|null} err
 */

/**
 * @param {uninstallCelestiaCallback} callback
 * @returns {void}
 */
module.exports = callback => {
  childProcess.exec(
    UNINSTALL_LIGHT_NODE_COMMAND,
    { cwd: celestiaDockerFolderPath },
    (err, stdout, stderr) => {
      if (err)
        return callback('terminal_error');

      console.log(stdout, stderr);

      return callback(null);
    }
  );
};
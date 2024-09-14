const childProcess = require('child_process');
const path = require('path');

const UNINSTALL_LIGHT_NODE_COMMAND = 'docker compose down --volumes --rmi all';

/**
 * @callback uninstallAvailCallback
 * @param {string|null} err
 */
/**
 * @param {uninstallAvailCallback} callback
 * @returns {void}
 */
module.exports = callback => {
  childProcess.exec(
    UNINSTALL_LIGHT_NODE_COMMAND,
    { cwd: path.join(__dirname, '../light-node') },
    (err, stdout, stderr) => {
      if (err)
        return callback('terminal_error');

      console.log(stdout, stderr);

      return callback(null);
    }
  );
};
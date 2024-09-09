const childProcess = require('child_process');
const path = require('path');

const LIGHT_NODE_ALREADY_INSTALLED_REGEX = /Container (.*?) Running/;

/**
 * @callback installAvailCallback
 * @param {string|null} err
 */
/**
 * @param {installAvailCallback} callback
 * @returns {void}
 */
module.exports = callback => {
  childProcess.exec(
    'docker compose up --detach',
    { cwd: path.join(__dirname, '../light-node') },
    (err, stdout, stderr) => {
      if (err)
        return callback('terminal_error');

      console.log(stdout, stderr);

      if (LIGHT_NODE_ALREADY_INSTALLED_REGEX.test(stderr))
        return callback('already_installed');

      return callback(null);
    }
  );
};
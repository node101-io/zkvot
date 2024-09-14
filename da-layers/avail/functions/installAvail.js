const childProcess = require('child_process');
const path = require('path');

const fetchMnemonicFromNode = require('./fetchMnemonicFromNode');

const SafeStore = require('../../../utils/safeStore');

const INSTALL_LIGHT_NODE_COMMAND = 'docker compose up --detach';
const LIGHT_NODE_ALREADY_INSTALLED_REGEX = /Container (.*?) Running/;
const WAIT_FOR_MNEMONIC_TIMEOUT = 100;

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
    INSTALL_LIGHT_NODE_COMMAND,
    { cwd: path.join(__dirname, '../light-node') },
    (err, stdout, stderr) => {
      if (err)
        return callback('terminal_error');

      console.log(stdout, stderr);

      if (LIGHT_NODE_ALREADY_INSTALLED_REGEX.test(stderr))
        return callback('already_installed');

      setTimeout(() => {
        fetchMnemonicFromNode((err, mnemonic) => {
          if (err)
            return callback(err);

          SafeStore.keepAvailMnemonic(mnemonic, err => {
            if (err)
              return callback(err);

            return callback(null);
          });
        });
      }, WAIT_FOR_MNEMONIC_TIMEOUT);
    }
  );
};
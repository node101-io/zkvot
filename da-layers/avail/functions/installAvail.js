const { app } = require('electron');
const childProcess = require('child_process');
const path = require('path');

const fetchMnemonicFromNode = require('./fetchMnemonicFromNode');

const copyDockerFilesToUserFolder = require('../../../utils/copyDockerFilesToUserFolder');
const createDockerFolderIfDoesntExist = require('../../../utils/createDockerFolderIfDoesntExist');
const SafeStore = require('../../../utils/safeStore');

const templateComposeFilePath = path.join(__dirname, '../light-node/docker-compose.yaml');
const templateDockerfilePath = path.join(__dirname, '../light-node/Dockerfile');

const availDockerFolderPath = path.join(app.getPath('userData'), 'zkvote-node/avail');
const availComposeFilePath = path.join(availDockerFolderPath, 'docker-compose.yaml');
const availDockerfilePath = path.join(availDockerFolderPath, 'Dockerfile');

const INSTALL_LIGHT_NODE_COMMAND = 'docker compose up --detach';
const LIGHT_NODE_ALREADY_INSTALLED_REGEX = /Container (.*?) Running/;
const WAIT_FOR_MNEMONIC_TIMEOUT_IN_MS = 100;

/**
 * @callback installAvailCallback
 * @param {string|null} err
 */
/**
 * @param {installAvailCallback} callback
 * @returns {void}
 */
module.exports = (data, callback) => {
  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.app_id || isNaN(data.app_id) || Number(data.app_id) < 0)
    return callback('bad_request');

  if (!data.block_height || isNaN(data.block_height) || Number(data.block_height) < 0)
    return callback('bad_request');

  createDockerFolderIfDoesntExist(availDockerFolderPath, err => {
    if (err)
      return callback(err);

    copyDockerFilesToUserFolder({
      old_path: templateComposeFilePath,
      new_path: availComposeFilePath,
      replacements: {
        app_id_placeholder: data.app_id,
        sync_start_block_placeholder: data.block_height
      }
    }, err => {
      if (err)
        return callback(err);

      copyDockerFilesToUserFolder({
        old_path: templateDockerfilePath,
        new_path: availDockerfilePath
      }, err => {
        if (err)
          return callback(err);

        childProcess.exec(
          INSTALL_LIGHT_NODE_COMMAND,
          { cwd: availDockerFolderPath },
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
            }, WAIT_FOR_MNEMONIC_TIMEOUT_IN_MS);
          }
        );
      });
    });
  });
};
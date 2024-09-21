const { app } = require('electron');
const childProcess = require('child_process');
const path = require('path');

const fetchAuthKeyFromNode = require('./fetchAuthKeyFromNode');

const copyDockerFilesToUserFolder = require('../../../utils/copyDockerFilesToUserFolder');
const createDockerFolderIfDoesntExist = require('../../../utils/createDockerFolderIfDoesntExist');
const SafeStore = require('../../../utils/safeStore');

const templateComposeFilePath = path.join(__dirname, '../light-node/docker-compose.yaml');
const templateDockerfilePath = path.join(__dirname, '../light-node/Dockerfile');

const celestiaDockerFolderPath = path.join(app.getPath('userData'), 'zkvote-node/celestia');
const celestiaComposeFilePath = path.join(celestiaDockerFolderPath, 'docker-compose.yaml');
const celestiaDockerfilePath = path.join(celestiaDockerFolderPath, 'Dockerfile');

const INSTALL_LIGHT_NODE_COMMAND = 'docker compose up --detach';
const LIGHT_NODE_ALREADY_INSTALLED_REGEX = /Container (.*?) Running/;

/**
 * @typedef {Object} installCelestiaData
 * @property {string} block_hash
 */
/**
 * @callback installCelestiaCallback
 * @param {string|null} err
 */
/**
 * @param {installCelestiaData} data
 * @param {installCelestiaCallback} callback
 * @returns {void}
 */
module.exports = (data, callback) => {
  if (!data || typeof data != 'object') return callback('bad_request');

  if (!data.block_hash || typeof data.block_hash != 'string' || !data.block_hash.trim().length)
    return callback('bad_request');

  createDockerFolderIfDoesntExist(celestiaDockerFolderPath, (err) => {
    if (err)
      return callback(err);

    copyDockerFilesToUserFolder({
      old_path: templateComposeFilePath,
      new_path: celestiaComposeFilePath,
      replacements: {
        trusted_block_hash_placeholder: data.block_hash
      }
    }, err => {
      if (err)
        return callback(err);

      copyDockerFilesToUserFolder({
        old_path: templateDockerfilePath,
        new_path: celestiaDockerfilePath
      }, err => {
        if (err)
          return callback(err);

        childProcess.exec(
          INSTALL_LIGHT_NODE_COMMAND,
          { cwd: celestiaDockerFolderPath },
          (err, stdout, stderr) => {
            if (err)
              return callback('terminal_error');

            console.log(stdout, stderr);

            if (LIGHT_NODE_ALREADY_INSTALLED_REGEX.test(stderr))
              return callback('already_installed');

            fetchAuthKeyFromNode((err, authKey) => {
              if (err)
                return callback(err);

              SafeStore.keepCelestiaAuthKey(authKey, err => {
                if (err)
                  return callback(err);

                return callback(null);
              });
            });
          }
        );
      });
    });
  });
};
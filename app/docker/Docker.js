const os = require('os');

const activateDocker = require('./functions/activateDocker');
const getDockerInstallationUrlByOS = require('./functions/getDockerInstallationUrlByOS');
const isDockerActive = require('./functions/isDockerActive');
const isDockerInstalled = require('./functions/isDockerInstalled');

const Docker = {
  /**
   * @callback isReadyCallback
   * @param {null} err
   * @param {boolean} isReady
   */
  /**
   * @param {isReadyCallback} callback
   * @returns {void}
   */
  isReady: callback => {
    isDockerInstalled((err, isInstalled) => {
      if (err)
        return callback(err);

      if (!isInstalled) {
        return callback(null, false);
      } else {
        isDockerActive((err, isActive) => {
          if (err)
            return callback(err);

          if (!isActive) {
            return callback(null, false);
          } else {
            return callback(null, true);
          };
        });
      };
    });
  },
  /**
   * @callback activateCallback
   * @param {string|null} err
   */
  /**
   * @param {activateCallback} callback
   * @returns {void}
   */
  activate: callback => {
    activateDocker(os.platform(), err => {
      if (err)
        return callback(err);

      return callback(null);
    });
  },
  /**
   * @callback getInstallationUrlCallback
   * @param {string|null} err
   * @param {string|null} installationUrl
   */
  /**
   * @param {getInstallationUrlCallback} callback
   * @returns {void}
   */
  getInstallationUrl: callback => {
    getDockerInstallationUrlByOS({
      platform: os.platform(),
      arch: os.arch()
    }, (err, installationUrl) => {
      if (err)
        return callback(err);

      return callback(null, installationUrl);
    });
  }
};

module.exports = Docker;
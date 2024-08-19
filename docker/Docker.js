const os = require('os');

const activateDocker = require('./functions/activateDocker');
const getDockerInstallationUrlByOS = require('./functions/getDockerInstallationUrlByOS');
const isDockerActive = require('./functions/isDockerActive');
const isDockerInstalled = require('./functions/isDockerInstalled');

// Will be turned into a class
module.exports = {
  checkReady: callback => {
    isDockerInstalled((err, isInstalled) => {
      if (err)
        return callback(err);

      if (!isInstalled) {
        return callback('docker_not_installed');
      } else {
        isDockerActive((err, isActive) => {
          if (err)
            return callback(err);

          if (!isActive) {
            return callback('docker_not_active');
          } else {
            return callback(null, 'docker_active');
          };
        });
      };
    });
  },
  activate: callback => {
    activateDocker(platform, err => {
      if (err)
        return callback(err);

      return callback(null, 'docker_activated');
    });
  },
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
const os = require('os');

const activateDocker = require('./methods/activateDocker');
const getDockerInstallationUrlByOs = require('./utils/getDockerInstallationUrlByOs');
const isDockerActive = require('./methods/isDockerActive');
const isDockerInstalled = require('./methods/isDockerInstalled');

const platform = os.platform();
const arch = os.arch();

// Will be turned into a class
module.exports = {
  isRunning: callback => {
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
    getDockerInstallationUrlByOs({
      platform,
      arch
    }, (err, installationUrl) => {
      if (err)
        return callback(err);

      return callback(null, installationUrl);
    });
  }
};
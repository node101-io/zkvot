const os = require('os');

const activateDocker = require('./methods/activateDocker');
const isDockerActive = require('./methods/isDockerActive');
const isDockerInstalled = require('./methods/isDockerInstalled');

const getDockerInstallationUrlByPlatform = require('./utils/getDockerInstallationUrlByPlatform');

const SUPPORTED_PLATFORMS = [ 'darwin', 'linux' ];

const platform = os.platform();

// Will be turned into a class
module.exports = {
  init: (platform, callback) => {
    if (!platform || typeof platform != 'string' || !platform.trim().length)
      return callback('bad_request');

    if (!SUPPORTED_PLATFORMS.includes(platform))
      return callback('platform_not_supported');

    return callback(null);
  },
  isInstalled: callback => {
    isDockerInstalled(isInstalled => {
      if (!isInstalled) {
        getDockerInstallationUrlByPlatform(
          platform,
          (err, installationUrl) => {
            if (err)
              return callback(err);

            return callback(null, installationUrl);
          }
        );
      } else {
        return callback(null, 'docker_installed');
      };
    });
  },
  isActive: callback => {
    isDockerActive(isActive => {
      if (!isActive) {
        return callback('docker_not_active');
      } else {
        return callback(null, 'docker_active');
      };
    });
  },
  activate: (platform, callback) => {
    if (!platform || typeof platform != 'string' || !platform.trim().length || !SUPPORTED_PLATFORMS.includes(platform))
      return callback('bad_request');

    activateDocker(platform, err => {
      if (err)
        return callback(err);

      return callback(null, 'docker_activated');
    });
  }
};
const SUPPORTED_PLATFORMS = [ 'darwin', 'linux' ];

const DOCKER_INSTALLATION_URL_FOR_DARWIN = 'https://docs.docker.com/desktop/install/mac-install';
const DOCKER_INSTALLATION_URL_FOR_LINUX = 'https://docs.docker.com/desktop/install/linux-install';

/**
 * @callback getDockerInstallationUrlByPlatformCallback
 * @param {string|null} err
 * @param {string|null} installationUrl
 */

/**
 * @param {string} platform
 * @param {getDockerInstallationUrlByPlatformCallback} callback
 * @returns {void}
 */
module.exports = (platform, callback) => {
  if (!platform || typeof platform != 'string' || !platform.trim().length || !SUPPORTED_PLATFORMS.includes(platform))
    return callback('bad_request');

  if (platform == 'linux') {
    return callback(null, DOCKER_INSTALLATION_URL_FOR_LINUX);
  } else if (platform == 'darwin') {
    return callback(null, DOCKER_INSTALLATION_URL_FOR_DARWIN);
  };
};
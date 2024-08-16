const DOCKER_INSTALLATION_URL_DARWIN_ARM64 = 'https://desktop.docker.com/mac/main/arm64/Docker.dmg';
const DOCKER_INSTALLATION_URL_DARWIN_AMD64 = 'https://desktop.docker.com/mac/main/amd64/Docker.dmg';

const DOCKER_INSTALLATION_URL_LINUX = 'https://docs.docker.com/desktop/install/linux-install/';

const DOCKER_INSTALLATION_URL_WIN32_AMD64 = 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe';
const DOCKER_INSTALLATION_URL_WIN32_ARM64 = 'https://desktop.docker.com/win/main/arm64/Docker%20Desktop%20Installer.exe';

/**
 * @typedef {Object} OsData
 * @property {string} platform
 * @property {string} arch
 */

/**
 * @param {OsData} data
 * @param {getDockerInstallationUrlByOsCallback} callback
 * @returns {void}
 */
module.exports = (data, callback) => {
  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.platform || typeof data.platform != 'string' || !data.platform.trim().length)
    return callback('bad_request');

  if (!data.arch || typeof data.arch != 'string' || !data.arch.trim().length)
    return callback('bad_request');

  if (data.platform == 'darwin') {
    if (data.arch == 'arm64') {
      return callback(null, DOCKER_INSTALLATION_URL_DARWIN_ARM64);
    } else if (data.arch == 'amd64') {
      return callback(null, DOCKER_INSTALLATION_URL_DARWIN_AMD64);
    } else {
      return callback('bad_request');
    };
  } else if (data.platform == 'linux') {
    return callback(null, DOCKER_INSTALLATION_URL_LINUX);
  } else if (data.platform == 'win32') {
    if (data.arch == 'x64') {
      return callback(null, DOCKER_INSTALLATION_URL_WIN32_AMD64);
    } else if (data.arch == 'arm64') {
      return callback(null, DOCKER_INSTALLATION_URL_WIN32_ARM64);
    } else {
      return callback('bad_request');
    };
  } else {
    return callback('bad_request');
  };
};
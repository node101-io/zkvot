const DOCKER_INSTALLATION_URL_DARWIN_ARM64: string = 'https://desktop.docker.com/mac/main/arm64/Docker.dmg';
const DOCKER_INSTALLATION_URL_DARWIN_AMD64: string = 'https://desktop.docker.com/mac/main/amd64/Docker.dmg';

const DOCKER_INSTALLATION_URL_WIN32_AMD64: string = 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe';
const DOCKER_INSTALLATION_URL_WIN32_ARM64: string = 'https://desktop.docker.com/win/main/arm64/Docker%20Desktop%20Installer.exe';

export default (
  data: {
    platform: string,
    arch: string
  },
  callback: (err: string | null, installationUrl?: string) => void
) => {
  if (data.platform == 'darwin') {
    if (data.arch == 'arm64')
      return callback(null, DOCKER_INSTALLATION_URL_DARWIN_ARM64);

    if (data.arch == 'amd64')
      return callback(null, DOCKER_INSTALLATION_URL_DARWIN_AMD64);

    return callback('bad_request');
  } else if (data.platform == 'win32') {
    if (data.arch == 'x64')
      return callback(null, DOCKER_INSTALLATION_URL_WIN32_AMD64);

    if (data.arch == 'arm64')
      return callback(null, DOCKER_INSTALLATION_URL_WIN32_ARM64);

    return callback('bad_request');
  } else {
    return callback('not_supported_os');
  };
};

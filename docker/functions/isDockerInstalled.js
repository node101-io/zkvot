const dockerCLI = require('docker-cli-js');
const isDockerInstalledCommand = require('../commands/is-docker-installed/command');

const Docker = new dockerCLI.Docker();

/**
 * @callback isDockerInstalledCallback
 * @param {null} err
 * @param {boolean} installed
 */

/**
 * @param {isDockerInstalledCallback} callback
 * @returns {void}
 */
module.exports = callback => {
  const originalStderrWrite = process.stderr.write;
  const originalStdoutWrite = process.stdout.write;

  process.stderr.write = () => {};
  process.stdout.write = () => {};

  Docker.command(isDockerInstalledCommand().trim(), (err, res) => {
    process.stderr.write = originalStderrWrite;
    process.stdout.write = originalStdoutWrite;
    if (err)
      return callback(null, false);

    return callback(null, true);
  });
};
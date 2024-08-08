const dockerCLI = require('docker-cli-js');

const isDockerActivecommand = require('../commands/is-docker-active/command');

const Docker = new dockerCLI.Docker();

/**
 * @callback isDockerActiveCallback
 * @param {null} err
 * @param {boolean} active
 */

/**
 * @param {isDockerActiveCallback} callback
 * @returns {void}
 */
module.exports = callback => {
  const originalStderrWrite = process.stderr.write;
  const originalStdoutWrite = process.stdout.write;

  process.stderr.write = () => {};
  process.stdout.write = () => {};

  Docker.command(isDockerActivecommand().trim(), (err, res) => {
    process.stderr.write = originalStderrWrite;
    process.stdout.write = originalStdoutWrite;
    if (err)
      return callback(null, false);

    return callback(null, true);
  });
};
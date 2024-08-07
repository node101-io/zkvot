const dockerCLI = require('docker-cli-js');
const isDockerInstalledCommand = require('../commands/isDockerInstalled');

const Docker = new dockerCLI.Docker();

/**
 * @callback isDockerInstalledCallback
 * @param {null} error
 * @param {boolean} installed
 */

/**
 * @param {isDockerInstalledCallback} callback
 * @returns {void}
 */
const is = callback => {
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

is((err, installed) => {
  if (err)
    return console.error(err);

  console.log(installed);
});
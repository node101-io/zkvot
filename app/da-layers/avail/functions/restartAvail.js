const childProcess = require('child_process');

const RESTART_AVAIL_COMMAND = `docker restart zkvote-node-avail`;

module.exports = callback => {
  childProcess.exec(
    RESTART_AVAIL_COMMAND,
    (err, stdout, stderr) => {
      if (err)
        return callback('terminal_error');

      return callback(null);
    }
  );
};
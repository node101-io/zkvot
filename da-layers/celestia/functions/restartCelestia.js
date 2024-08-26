const childProcess = require('child_process');

const RESTART_CELESTIA_COMMAND = `docker restart zkvote-node-celestia`;

module.exports = callback => {
  childProcess.exec(
    RESTART_CELESTIA_COMMAND,
    (err, stdout, stderr) => {
      if (err)
        return callback('terminal_error');

      return callback(null);
    }
  );
};
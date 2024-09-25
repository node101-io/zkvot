const childProcess = require('child_process');

const CHANGE_APP_ID_COMMAND = data => `
  docker exec zkvote-node-avail bash -c 'sed -i "s|app_id = .*|app_id = ${data.app_id}|" $DAEMON_HOME/$CHAIN_ID/config/config.toml'
`;

module.exports = (data, callback) => {
  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.app_id || isNaN(data.app_id) || Number(data.app_id) < 0)
    return callback('bad_request');

  childProcess.exec(
    CHANGE_APP_ID_COMMAND(data),
    (err, stderr, stdout) => {
      if (err)
        return callback('terminal_error');

      console.log(stderr, stdout);

      return callback(null);
    }
  );
};
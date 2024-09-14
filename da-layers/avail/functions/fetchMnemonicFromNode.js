const childProcess = require('child_process');

const GET_MNEMONIC_COMMAND = `
  docker exec zkvote-node-avail bash -c 'grep avail_secret_uri "$DAEMON_HOME/$CHAIN_ID/identity/identity.toml" | sed "s/avail_secret_uri = //g" | tr -d \\\\047'
`;

module.exports = callback => {
  childProcess.exec(
    GET_MNEMONIC_COMMAND,
    (err, mnemonic) => {
      if (err)
        return callback('terminal_error');

      return callback(null, mnemonic.trim());
    }
  );
};
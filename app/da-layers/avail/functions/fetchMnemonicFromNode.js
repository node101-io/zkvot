const childProcess = require('child_process');

const GET_MNEMONIC_COMMAND = `
  docker exec zkvote-node-avail bash -c 'grep avail_secret_uri "$DAEMON_HOME/$CHAIN_ID/identity/identity.toml" | sed "s/avail_secret_uri = //g" | tr -d \\\\047'
`;
const FETCH_MNEMONIC_FROM_NODE_INTERVAL_MAX_RETRY = 10;
const FETCH_MNEMONIC_FROM_NODE_INTERVAL_IN_MS = 1000;

const fetchMnemonicFromNode = (count, callback) => {
  childProcess.exec(
    GET_MNEMONIC_COMMAND,
    (err, mnemonic) => {
      if (err)
        return callback('terminal_error');

      if (count >= FETCH_MNEMONIC_FROM_NODE_INTERVAL_MAX_RETRY)
        return callback('timed_out');

      if (!mnemonic)
        return setTimeout(_ => fetchMnemonicFromNode(count + 1, callback), FETCH_MNEMONIC_FROM_NODE_INTERVAL_IN_MS);

      return callback(null, mnemonic.trim());
    }
  );
};

module.exports = fetchMnemonicFromNode;
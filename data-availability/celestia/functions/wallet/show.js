const childProcess = require('child_process');

const JSON_OBJECT_REGEX = /(\{.*\})/s;
const SHOW_WALLET_COMMAND = `
  docker exec zkvote-node-celestia bash -c '
    cel-key show my_celes_key \
      --keyring-backend test \
      --node.type $NODE_TYPE \
      --p2p.network $CHAIN_ID \
      --output json
  '
`;

/**
 * @callback showWalletCallback
 * @param {string|null} err
 * @param {Object|null} wallet
 */

/**
 * @param {showWalletCallback} callback
 * @returns {void}
 */
module.exports = callback => {
  childProcess.exec(
    SHOW_WALLET_COMMAND,
    (err, stderr, stdout) => {
      if (err)
        return callback('terminal_error');

      stdout = stdout ? stdout : stderr;
      stdout = stdout.match(JSON_OBJECT_REGEX)[0];

      return callback(null, JSON.parse(stdout));
    }
  );
};
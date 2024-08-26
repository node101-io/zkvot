const childProcess = require('child_process');

const CREATE_WALLET_COMMAND = `
  docker exec zkvote-node-celestia bash -c '
    echo y | cel-key add my_celes_key \
      --keyring-backend test \
      --node.type $NODE_TYPE \
      --p2p.network $CHAIN_ID \
      --output json
  '
`;

/**
 * @callback createWalletCallback
 * @param {string|null} err
 * @param {Object|null} wallet
 */

/**
 * @param {createWalletCallback} callback
 * @returns {void}
 */
module.exports = callback => {
  childProcess.exec(
    CREATE_WALLET_COMMAND,
    (err, stderr, stdout) => {
      if (err)
        return callback('terminal_error');

      return callback(null, JSON.parse(stdout));
    }
  );
};
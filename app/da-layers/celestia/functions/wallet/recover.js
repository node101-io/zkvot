const childProcess = require('child_process');

/**
 * @param {RecoverWalletData} data
 * @returns {string}
 */
const RECOVER_WALLET_COMMAND = data =>`
  docker exec zkvote-node-celestia bash -c '(
    echo y;
    echo ${data.mnemonic};
  ) | cel-key add my_celes_key \
    --keyring-backend test \
    --node.type $NODE_TYPE \
    --p2p.network $CHAIN_ID \
    --recover \
    --output json
  '
`;

/**
 * @typedef {Object} RecoverWalletData
 * @property {string} mnemonic
 */
/**
 * @callback recoverWalletCallback
 * @param {string|null} err
 * @param {Object|null} wallet
 */
/**
 * @param {RecoverWalletData} data
 * @param {recoverWalletCallback} callback
 * @returns {void}
 */
module.exports = (data, callback) => {
  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.mnemonic || typeof data.mnemonic != 'string')
    return callback('bad_request');

  childProcess.exec(
    RECOVER_WALLET_COMMAND(data),
    (err, stderr, stdout) => {
      if (err)
        return callback('terminal_error');

      stdout = stdout ? stdout : stderr;

      return callback(null, JSON.parse(stdout));
    }
  );
};
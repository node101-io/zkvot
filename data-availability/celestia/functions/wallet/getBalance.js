const childProcess = require('child_process');
const validator = require('validator');

/**
 * @param {getWalletBalanceData} data
 * @returns {string}
 */
const GET_WALLET_BALANCE_COMMAND = data => `
  docker exec zkvote-node-celestia bash -c '
    celestia state balance-for-address ${data.address} \
      --url ${data.rpcURL}
  '
`;

/**
 * @typedef {Object} getWalletBalanceData
 * @property {string} address
 * @property {string} rpcURL
 */

/**
 * @callback getWalletBalanceCallback
 * @param {string|null} err
 * @param {Object|null} balance
 */

/**
 * @param {getWalletBalanceData} data
 * @param {getWalletBalanceCallback} callback
 * @returns {void}
 */
module.exports = (data, callback) => {
  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.address || typeof data.address != 'string')
    return callback('bad_request');

  if (!data.rpcURL || !validator.isURL(data.rpcURL.toString()))
    return callback('bad_request');

  childProcess.exec(
    GET_WALLET_BALANCE_COMMAND(data),
    (err, stderr, stdout) => {
      if (err)
        return callback('terminal_error');

      stdout = stdout ? stdout : stderr;

      return callback(null, JSON.parse(stdout.result));
    }
  );
};
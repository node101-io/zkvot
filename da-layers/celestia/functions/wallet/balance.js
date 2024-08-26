const validator = require('validator');

const celestiaRequest = require('../celestiaRequest');

/**
 * @callback getBalanceCallback
 * @param {string|null} err
 * @param {Object|null} balance
 */

/**
 * @param {string} rpc_url
 * @param {getBalanceCallback} callback
 * @returns {void}
 */
module.exports = (rpc_url, callback) => {
  if (!rpc_url || !validator.isURL(rpc_url.toString()))
    return callback('bad_request');

  celestiaRequest(rpc_url, {
    method: 'state.Balance',
    params: []
  }, (err, res) => {
    if (err)
      return callback(err);

    return callback(null, res.result);
  });
};
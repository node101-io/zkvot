const validator = require('validator');

const fetch = require('../../../utils/fetch');

/**
 * @callback isCelestiaInstalledCallback
 * @param {string|null} error
 * @param {boolean|null} installed
 */

/**
 * @param {string} rpc_url
 * @param {isCelestiaInstalledCallback} callback
 * @returns {void}
 */
module.exports = (rpc_url, callback) => {
  if (!rpc_url || !validator.isURL(rpc_url.toString()))
    return callback('bad_request');

  fetch(rpc_url, {
    method: 'node.Ready',
    params: []
  }, (err, res) => {
    if (err)
      return callback(err);

    if (!res || typeof res != 'object' || !res.result || typeof res.result != 'boolean')
      return callback(null, false);

    return callback(null, true);
  });
};
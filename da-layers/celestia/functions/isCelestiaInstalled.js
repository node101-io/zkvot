const validator = require('validator');

const celestiaRequest = require('./celestiaRequest');
const fetchAuthKeyFromNode = require('./fetchAuthKeyFromNode');

const SafeStore = require('../../../utils/safeStore');

/**
 * @callback isCelestiaInstalledCallback
 * @param {string|null} error
 * @param {boolean|null} isInstalled
 */

/**
 * @param {string} rpc_url
 * @param {isCelestiaInstalledCallback} callback
 * @returns {void}
 */
module.exports = (rpc_url, callback) => {
  if (!rpc_url || !validator.isURL(rpc_url.toString()))
    return callback('bad_request');

  fetchAuthKeyFromNode((err, authKey) => {
    if (err)
      return callback(null, false);

    SafeStore.keepCelestiaAuthKey(authKey, err => {
      if (err)
        return callback(null, false);

      celestiaRequest(rpc_url, {
        method: 'node.Ready',
        params: []
      }, (err, res) => {
        if (err)
          return callback(err);

        if (!res || typeof res != 'object' || !res.result || typeof res.result != 'boolean')
          return callback(null, false);

        return callback(null, true);
      });
    });
  });
};
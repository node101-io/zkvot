const fetch = require('node-fetch');

const rpcURL = 'localhost:26658'

const MAX_DEFAULT_TEXT_FIELD_LENGTH = 1e4;

/**
 * @typedef {Object} GetData
 * @property {number} blockHeight
 * @property {string} namespaceHex
 */

/**
 * @callback getDataCallback
 * @param {string|null} error
 * @param {string|null} blobsData
 */

/**
 * @param {GetData} data
 * @param {getDataCallback} callback
 *
 * @returns {void}
 */

module.exports = (data, callback) => {
  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.blockHeight || isNaN(data.blockHeight) || Number(data.blockHeight) < 0)
    return callback('bad_request');

  if (!data.namespaceHex || typeof data.namespaceHex != 'string' || !data.namespaceHex.trim().length || data.namespaceHex.trim().length > MAX_DEFAULT_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  fetch(rpcURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.CELESTIA_NODE_AUTH_KEY
    },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'blob.GetAll',
      params: [
        data.blockHeight,
        [
          data.namespaceHex.trim()
        ]
      ]
    })
  })
  .then(res => res.json())
  .then(res => {
    return callback(null, res.result); // returns all blobs at the given height under the given namespace
  })
  .catch(err => {
    console.log(err);

    return callback('fetch_error');
  });
};
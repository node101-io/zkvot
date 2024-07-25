const fetch = require('node-fetch');

const rpcURL = 'localhost:26658'

const MAX_DEFAULT_TEXT_FIELD_LENGTH = 1e4;

/**
 * @typedef {Object} SubmitData
 * @property {string} namespaceHex
 * @property {string} dataHex
 * @property {string} commitment
 */

/**
 * @callback submitDataCallback
 * @param {string|null} error
 * @param {string|null} blockHeight
 */

/**
 * @param {SubmitData} data
 * @param {submitDataCallback} callback
 *
 * @returns {void}
 */

module.exports = (data, callback) => {
  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.namespaceHex || typeof data.namespaceHex != 'string' || !data.namespaceHex.trim().length || data.namespaceHex.trim().length > MAX_DEFAULT_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.dataHex || typeof data.dataHex != 'string' || !data.dataHex.trim().length || data.dataHex.trim().length > MAX_DEFAULT_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.commitment || typeof data.commitment != 'string' || !data.commitment.trim().length || data.commitment.trim().length > MAX_DEFAULT_TEXT_FIELD_LENGTH)
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
      method: 'blob.Submit',
      params: [
        [
          {
            namespace: data.namespaceHex.trim(),
            data: data.dataHex.trim(),
            share_version: 1,
            commitment: data.commitment.trim(),
            index: 0
          }
        ],
        0.002
      ]
    })
  })
  .then(res => res.json())
  .then(res => {
    return callback(null, res.result); // returns the block height of the block containing the submitted data
  })
  .catch(err => {
    console.log(err);

    return callback('fetch_error');
  });
};
const fetch = require('../../utils/fetch');

const DEFAULT_MAX_TEXT_FIELD_LENGTH = 1e4;
const DEFAULT_RPC_URL = 'http://127.0.0.1:26658';
const DEFAULT_TX_FEE = 0.002;

// Could be turned into a class - need to learn more about classes though
const Celestia = {
  init: callback => {}, // To be planned - will install the light node on :10101 if not already running
  /**
   * @typedef {Object} GetData
   * @property {number} blockHeight
   * @property {string} namespaceHex
   */

  /**
   * @callback getDataCallback
   * @param {string|null} error
   * @param {Object[]|null} blobsData
   */

  /**
   * @param {GetData} data
   * @param {getDataCallback} callback
   * @returns {void}
   */
  getData: (data, callback) => {
    if (!data || typeof data != 'object')
      return callback('bad_request');

    if (!data.blockHeight || isNaN(data.blockHeight) || Number(data.blockHeight) < 0)
      return callback('bad_request');

    if (!data.namespaceHex || typeof data.namespaceHex != 'string' || !data.namespaceHex.trim().length || data.namespaceHex.trim().length > DEFAULT_MAX_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    fetch(DEFAULT_RPC_URL, {
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
    }, (err, res) => {
      if (err)
        return callback(err);

      return callback(null, res.result);
    });
  },
  /**
   * @typedef {Object} SubmitData
   * @property {string} namespaceHex
   * @property {string} dataHex
   * @property {string} commitment
   */

  /**
   * @callback submitDataCallback
   * @param {string|null} error
   * @param {string|number|null} blockHeight
   * */

  /**
   * @param {SubmitData} data
   * @param {submitDataCallback} callback
   * @returns {void}
   * */
  submitData: (data, callback) => {
    if (!data || typeof data != 'object')
      return callback('bad_request');

    if (!data.namespaceHex || typeof data.namespaceHex != 'string' || !data.namespaceHex.trim().length || data.namespaceHex.trim().length > DEFAULT_MAX_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    if (!data.dataHex || typeof data.dataHex != 'string' || !data.dataHex.trim().length || data.dataHex.trim().length > DEFAULT_MAX_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    if (!data.commitment || typeof data.commitment != 'string' || !data.commitment.trim().length || data.commitment.trim().length > DEFAULT_MAX_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    fetch(DEFAULT_RPC_URL, {
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
          DEFAULT_TX_FEE
        ]
      })
    }, (err, res) => {
      if (err)
        return callback(err);

      return callback(null, res.result);
    });
  }
};

module.exports = Celestia;
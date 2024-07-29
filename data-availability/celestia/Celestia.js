const fetch = require('../../utils/fetch');
const isPortInUse = require('../../utils/isPortInUse');

const isCelestiaInstalled = require('./functions/isCelestiaInstalled');

const DEFAULT_MAX_TEXT_FIELD_LENGTH = 1e4;
const DEFAULT_RPC_PORT = 10101;
const DEFAULT_RPC_URL = 'http://127.0.0.1:10101';
const DEFAULT_TX_FEE = 0.002;

// Could be turned into a class - need to learn more about classes though
const Celestia = {
  init: callback => {
    isPortInUse(DEFAULT_RPC_PORT, (err, inUse) => {
      if (err)
        return callback(err);

      if (inUse)
        isCelestiaInstalled(DEFAULT_RPC_URL, (err, installed) => {
          if (err)
            return callback(err);

          if (installed)
            return callback(null, 'celestia_installed'); // Good to go, Celestia is installed

          if (!installed)
            return callback('celestia_not_installed'); // Use another port or kill the process on the port to start Celestia
        });

      if (!inUse) {
        // To be planned - will install the light node on :10101 if not already installed
        return callback('celestia_not_installed');
      }
    });
  },
  /**
   * @typedef {Object} GetData
   * @property {number} blockHeight
   * @property {string} namespaceHex
   */

  /**
   * @callback getDataCallback
   * @param {string|null} error
   * @param {Array|null} blobsData
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

    fetch(DEFAULT_RPC_URL,{
      method: 'blob.GetAll',
      params: [
        data.blockHeight,
        [
          data.namespaceHex.trim()
        ]
      ]
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
    }, (err, res) => {
      if (err)
        return callback(err);

      return callback(null, res.result);
    });
  }
};

module.exports = Celestia;
const fetch = require('../../utils/fetch');
const isPortInUse = require('../../utils/isPortInUse');

const encodeToBase64 = require('./functions/encodeToBase64');
const isBase64 = require('./functions/isBase64');
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
   * @property {string} namespace
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

    if (!data.namespace || typeof data.namespace != 'string' || !data.namespace.trim().length || data.namespace.trim().length > DEFAULT_MAX_TEXT_FIELD_LENGTH || !isBase64(data.namespace))
      return callback('bad_request');

    fetch(DEFAULT_RPC_URL,{
      method: 'blob.GetAll',
      params: [
        data.blockHeight,
        [
          data.namespace.trim()
        ]
      ]
    }, (err, res) => {
      if (err)
        return callback(err);

      return callback(null, res.result);
    });
  },
  /**
   * @callback submitDataCallback
   * @param {string|null} error
   * @param {string|null} blockHeight
   */

  /**
   * @param {string} namespace
   * @param {Object} data
   * @param {submitDataCallback} callback
   * @returns {void}
   */
  submitData: (namespace, data, callback) => {
    if (!namespace || typeof namespace != 'string' || !namespace.trim().length || namespace.trim().length > DEFAULT_MAX_TEXT_FIELD_LENGTH || !isBase64(namespace))
      return callback('bad_request');

    if (!data || typeof data != 'object')
      return callback('bad_request');

    encodeToBase64(data, (err, encodedData) => {
      if (err)
        return callback(err);

      fetch(DEFAULT_RPC_URL, {
        method: 'blob.Submit',
        params: [
          [
            {
              namespace: namespace.trim(),
              data: encodedData.trim(),
              share_version: 0,
              index: -1
            }
          ],
          DEFAULT_TX_FEE
        ]
      }, (err, res) => {
        if (err)
          return callback(err);

        return callback(null, res.result);
      });
    });
  }
};

module.exports = Celestia;
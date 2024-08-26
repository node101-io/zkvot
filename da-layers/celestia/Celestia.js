const isPortInUse = require('../../utils/isPortInUse');
const encodeToBase64String = require('../../utils/encodeToBase64String');
const isBase64String = require('../../utils/isBase64String');

const address = require('./functions/wallet/address');
const balance = require('./functions/wallet/balance');
const create = require('./functions/wallet/create');
const recover = require('./functions/wallet/recover');

const celestiaRequest = require('./functions/celestiaRequest');
const installCelestia = require('./functions/installCelestia');
const isCelestiaInstalled = require('./functions/isCelestiaInstalled');
const restartCelestia = require('./functions/restartCelestia');
const uninstallCelestia = require('./functions/uninstallCelestia');

const DEFAULT_RPC_PORT = 10101;
const DEFAULT_RPC_URL = 'http://127.0.0.1:10101';
const DEFAULT_TX_FEE = 0.002;

const Celestia = {
  /**
   * @callback initCallback
   * @param {string|null} err
   */

  /**
   * @param {initCallback} callback
   * @returns {void}
   */
  init: callback => {
    isPortInUse(DEFAULT_RPC_PORT, (err, inUse) => {
      if (err)
        return callback(err);

      if (!inUse) {
        installCelestia((err, res) => {
          if (err)
            return callback(err);

          return callback('celestia_installed_successfully');
        });
      } else {
        isCelestiaInstalled(DEFAULT_RPC_URL, (err, isInstalled) => {
          if (err)
            return callback(err);

          if (!isInstalled) {
            return callback('port_in_use_by_another_service');
          } else {
            return callback(null);
          };
        });
      };
    });
  },
  /**
   * @callback createWalletCallback
   * @param {string|null} err
   * @param {Object|null} wallet
   */

  /**
   * @param {createWalletCallback} callback
   * @returns {void}
   */
  createWallet: callback => {
    create((err, wallet) => {
      if (err)
        return callback(err);

      restartCelestia(err => {
        if (err)
          return callback(err);

        return callback(null, wallet);
      });
    })
  },
  /**
   * @typedef {Object} RecoverData
   * @property {string} mnemonic
   */

  /**
   * @callback recoverWalletCallback
   * @param {string|null} err
   * @param {Object|null} wallet
   */

  /**
   * @param {RecoverData} data
   * @param {recoverWalletCallback} callback
   * @returns {void}
   */
  recoverWallet: (data, callback) => {
    if (!data || typeof data != 'object')
      return callback('bad_request');

    if (!data.mnemonic || typeof data.mnemonic != 'string' || !data.mnemonic.trim().length)
      return callback('bad_request');

    recover(data, (err, wallet) => {
      if (err)
        return callback(err);

      restartCelestia(err => {
        if (err)
          return callback(err);

        return callback(null, wallet);
      });
    });
  },
  /**
   * @callback getWalletAddressCallback
   * @param {string|null} err
   * @param {string|null} address
   */

  /**
   * @param {getWalletAddressCallback} callback
   * @returns {void}
   */
  getWalletAddress: callback => {
    address(DEFAULT_RPC_URL, (err, address) => {
      if (err)
        return callback(err);

      return callback(null, address);
    });
  },
  /**
   * @callback getWalletBalanceCallback
   * @param {string|null} err
   * @param {Object|null} balance
   */

  /**
   * @param {getWalletBalanceCallback} callback
   * @returns {void}
   */
  getWalletBalance: callback => {
    balance(DEFAULT_RPC_URL, (err, balance) => {
      if (err)
        return callback(err);

      return callback(null, balance);
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

    if (!isBase64String(data.namespace))
      return callback('bad_request');

    celestiaRequest(DEFAULT_RPC_URL,{
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
    if (!isBase64String(namespace))
      return callback('bad_request');

    if (!data || typeof data != 'object')
      return callback('bad_request');

    encodeToBase64String(data, (err, encodedData) => {
      if (err)
        return callback(err);

      celestiaRequest(DEFAULT_RPC_URL, {
        method: 'blob.Submit',
        params: [
          [
            {
              namespace: namespace.trim(),
              data: encodedData.trim(),
              share_version: 0 // not needed but added
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
  },
  /**
   * @callback uninstallCallback
   * @param {string|null} err
   */

  /**
   * @param {uninstallCallback} callback
   * @returns {void}
   */
  uninstall: callback => {
    uninstallCelestia((err, res) => {
      if (err)
        return callback(err);

      return callback(null);
    });
  }
};

module.exports = Celestia;
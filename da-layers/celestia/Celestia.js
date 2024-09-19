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

const DEFAULT_RPC_PORT = 10102;
const DEFAULT_RPC_URL = 'http://127.0.0.1:10102';
const DEFAULT_TX_FEE = 0.002;

const SYNCING_IN_PROGRESS_ERROR_MESSAGE_REGEX = /header: syncing in progress:/;

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

          return callback(null);
        });
      } else {
        isCelestiaInstalled(DEFAULT_RPC_URL, (err, isInstalled) => {
          if (err)
            return callback(err);

          if (!isInstalled) {
            return callback('port_in_use');
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
   * @property {number} block_height
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

    if (!data.block_height || isNaN(data.block_height) || Number(data.block_height) < 0)
      return callback('bad_request');

    if (!isBase64String(data.namespace))
      return callback('bad_request');

    celestiaRequest(DEFAULT_RPC_URL,{
      method: 'blob.GetAll',
      params: [
        data.block_height,
        [
          data.namespace.trim()
        ]
      ]
    }, (err, res) => {
      if (err)
        return callback(err);

      console.log(1, res);

      if (SYNCING_IN_PROGRESS_ERROR_MESSAGE_REGEX.test(res.error.message))
        return callback('syncing_in_progress');

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
              share_version: 0
            }
          ],
          {
            gas_price: DEFAULT_TX_FEE
          }
        ]
      }, (err, res) => {
        if (err)
          return callback(err);

        console.log(0, res);

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
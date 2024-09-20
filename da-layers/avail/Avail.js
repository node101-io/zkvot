const isPortInUse = require('../../utils/isPortInUse');
const encodeToBase64String = require('../../utils/encodeToBase64String');

const address = require('./functions/wallet/address');
const balance = require('./functions/wallet/balance');
const create = require('./functions/wallet/create');
const recover = require('./functions/wallet/recover');

const availRequest = require('./functions/availRequest');
const changeAppId = require('./functions/changeAppId');
const installAvail = require('./functions/installAvail');
const isAvailInstalled = require('./functions/isAvailInstalled');
const restartAvail = require('./functions/restartAvail');
const uninstallAvail = require('./functions/uninstallAvail');

const DEFAULT_RPC_PORT = 10103;
const DEFAULT_RPC_URL = 'http://127.0.0.1:10103';

const Avail = {
  init: callback => {
    isPortInUse(DEFAULT_RPC_PORT, (err, inUse) => {
      if (err)
        return callback(err);

      if (!inUse) {
        installAvail((err, res) => {
          if (err)
            return callback(err);

          return callback(null);
        });
      } else {
        isAvailInstalled(DEFAULT_RPC_URL, (err, isInstalled) => {
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
  createWallet: callback => {
    create((err, wallet) => {
      if (err)
        return callback(err);

      restartAvail(err => {
        if (err)
          return callback(err);

        return callback(null, wallet);
      });
    });
  },
  recoverWallet: (data, callback) => {
    if (!data || typeof data !== 'object')
      return callback('bad_request');

    if (!data.mnemonic || typeof data.mnemonic !== 'string' || !data.mnemonic.trim().length)
      return callback('bad_request');

    recover(data, (err, wallet) => {
      if (err)
        return callback(err);

      restartAvail(err => {
        if (err)
          return callback(err);

        return callback(null, wallet);
      });
    });
  },
  getWalletAddress: callback => {
    address((err, address) => {
      if (err)
        return callback(err);

      return callback(null, address);
    });
  },
  getWalletBalance: callback => {
    balance((err, balance) => {
      if (err)
        return callback(err);

      return callback(null, balance);
    });
  },
  changeAppIdByProposal: (data, callback) => {
    if (!data || typeof data != 'object')
      return callback('bad_request');

    if (!data.app_id || isNaN(data.app_id) || Number(data.app_id) < 0)
      return callback('bad_request');

    changeAppId(data, err => {
      if (err)
        return callback(err);

      restartAvail(err => {
        if (err)
          return callback(err);

        return callback(null);
      });
    });
  },
  getData: (data, callback) => {
    if (!data || typeof data !== 'object')
      return callback('bad_request');

    if (!data.block_height || isNaN(data.block_height) || Number(data.block_height) < 0)
      return callback('bad_request');

    availRequest(`${DEFAULT_RPC_URL}/v2/blocks/${data.block_height}/data?fields=data`, {
      method: 'GET'
    }, (err, res) => {
      if (err)
        return callback(err);

      return callback(null, res);
    });
  },
  submitData: (data, callback) => {
    if (!data || typeof data !== 'object')
      return callback('bad_request');

    encodeToBase64String(data, (err, encodedData) => {
      if (err)
        return callback(err);

      availRequest(`${DEFAULT_RPC_URL}/v2/submit`, {
        method: 'POST',
        submit_data: encodedData
      }, (err, res) => {
        if (err)
          return callback(err);

        return callback(null, res);
      });
    });
  },
  uninstall: callback => {
    uninstallAvail(err => {
      if (err)
        return callback(err);

      return callback(null);
    });
  }
};

module.exports = Avail;
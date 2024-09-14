const isPortInUse = require('../../utils/isPortInUse');

const address = require('./functions/wallet/address');
const balance = require('./functions/wallet/balance');
const create = require('./functions/wallet/create');
const recover = require('./functions/wallet/recover');

const installAvail = require('./functions/installAvail');
const restartAvail = require('./functions/restartAvail');
const uninstallAvail = require('./functions/uninstallAvail');

const DEFAULT_RPC_PORT = 10103;

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
      } else { // check if avail is installed
        return callback(null);
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
  uninstall: callback => {
    uninstallAvail(err => {
      if (err)
        return callback(err);

      return callback(null);
    });
  }
};

module.exports = Avail;
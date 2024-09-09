const isPortInUse = require('../../utils/isPortInUse');

const installAvail = require('./functions/installAvail');
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
      } else { // check if avail is installed
        return callback(null);
      };
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
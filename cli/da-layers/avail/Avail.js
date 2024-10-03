import isPortInUse from '../../utils/isPortInUse.js';

import availRequest from './functions/availRequest.js';
import installAvail from './functions/installAvail.js';
import isAvailInstalled from './functions/isAvailInstalled.js';
import uninstallAvail from './functions/uninstallAvail.js';

const DEFAULT_RPC_PORT = 10103;
const DEFAULT_RPC_URL = 'http://127.0.0.1:10103';

const Avail = {
  init: (data, callback) => {
    if (!data || typeof data != 'object')
      return callback('bad_request');

    isPortInUse(DEFAULT_RPC_PORT, (err, inUse) => {
      if (err)
        return callback(err);

      if (!inUse) {
        installAvail(data, (err, res) => {
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
  getData: (data, callback) => {
    if (!data || typeof data != 'object')
      return callback('bad_request');

    if (!data.start_block_height || isNaN(data.start_block_height) || Number(data.start_block_height) < 0)
      return callback('bad_request');

    availRequest(`${DEFAULT_RPC_URL}/v2/blocks/${data.start_block_height}/data?fields=data`, {
      method: 'GET'
    }, (err, res) => {
      if (err)
        return callback(err);

      return callback(null, res);
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

export default Avail;
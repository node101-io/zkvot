import { CelestiaDataTx } from '../../types/daLayers.js';

import isBase64String from '../../utils/isBase64String.js';
import isPortInUse from '../../utils/isPortInUse.js';

import celestiaRequest from './functions/celestiaRequest.js';
import installCelestia from './functions/installCelestia.js';
import isCelestiaInstalled from './functions/isCelestiaInstalled.js';
import uninstallCelestia from './functions/uninstallCelestia.js';

const DEFAULT_RPC_PORT: number = 10102;
const DEFAULT_RPC_URL: string = 'http://127.0.0.1:10102';

const Celestia = {
  init: (
    data: {
    block_hash: string,
    block_height: number
  },
  callback: (err: Error | string | null) => void
  ) => {
    isPortInUse(DEFAULT_RPC_PORT, (err, inUse) => {
      if (err)
        return callback(err);

      if (!inUse) {
        installCelestia(data, err => {
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
  getData: (
    data: {
      block_height: number,
      namespace: string
    },
    callback: (err: Error | string | null, blockData?: CelestiaDataTx[]) => void
  ) => {
    if (!isBase64String(data.namespace))
      return callback('bad_request');

    celestiaRequest(DEFAULT_RPC_URL, {
      method: 'blob.GetAll',
      params: [
        data.block_height,
        [
          data.namespace
        ]
      ]
    }, (err, celestiaResponse) => {
      if (err)
        return callback(err);

      return callback(null, celestiaResponse.result);
    });
  },
  uninstall: (callback: (err: string | null) => void) => {
    uninstallCelestia(err => {
      if (err)
        return callback(err);

      return callback(null);
    });
  }
};

export default Celestia;

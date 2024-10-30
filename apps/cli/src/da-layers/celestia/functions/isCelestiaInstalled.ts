import db from '../../../utils/db.js';
import isURL from '../../../utils/isURL.js';

import celestiaRequest from './celestiaRequest.js';
import fetchAuthKeyFromNode from './fetchAuthKeyFromNode.js';

export default (
  rpc_url: string,
  callback: (err: Error | string | null, isInstalled?: boolean) => void
) => {
  if (!isURL(rpc_url))
    return callback('bad_request');

  fetchAuthKeyFromNode((err, authKey) => {
    if (err)
      return callback(err);

    db.put('celestia_auth_key', authKey, err => {
      if (err)
        return callback(err);

      celestiaRequest(rpc_url, {
        method: 'node.Ready',
        params: []
      }, (err, celestiaResponse) => {
        if (err)
          return callback(err);

        if (!celestiaResponse || typeof celestiaResponse !== 'object' || !celestiaResponse.result || typeof celestiaResponse.result !== 'boolean')
          return callback(null, false);

        return callback(null, true);
      });
    });
  });
};

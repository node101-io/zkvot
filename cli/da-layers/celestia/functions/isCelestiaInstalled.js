import validator from 'validator';

import db from '../../../utils/db.js'

import celestiaRequest from './celestiaRequest.js';
import fetchAuthKeyFromNode from './fetchAuthKeyFromNode.js';

export default (rpc_url, callback) => {
  if (!rpc_url || !validator.isURL(rpc_url.toString()))
    return callback('bad_request');

  fetchAuthKeyFromNode((err, authKey) => {
    if (err)
      return callback(null, false);

    db.put('celestia_auth_key', authKey, err => {
      if (err)
        return callback(null, false);

      celestiaRequest(rpc_url, {
        method: 'node.Ready',
        params: []
      }, (err, res) => {
        if (err)
          return callback(err);

        if (!res || typeof res != 'object' || !res.result || typeof res.result != 'boolean')
          return callback(null, false);

        return callback(null, true);
      });
    });
  });
};
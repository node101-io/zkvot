import isURL from '../../../utils/isURL.js';

import availRequest from './availRequest.js';

export default (
  rpc_url: string,
  callback: (err: string | null, isInstalled?: boolean) => void
) => {
  if (!isURL(rpc_url))
    return callback('bad_request');

  availRequest(`${rpc_url}/v2/status`, {
    method: 'GET'
  }, (err, availResponse) => {
    if (err)
      return callback(null, false);

    return callback(null, true);
  });
};

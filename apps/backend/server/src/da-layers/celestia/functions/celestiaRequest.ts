import db from '../../../utils/db.js';
import isURL from '../../../utils/isURL.js';

const BLOCK_DATA_NOT_FOUND_ERROR_MESSAGE_REGEX: RegExp = /header: given height is from the future: networkHeight: (.*?), requestedHeight: (.*?)/;
const SYNCING_IN_PROGRESS_ERROR_MESSAGE_REGEX: RegExp = /header: syncing in progress: localHeadHeight: (.*?), requestedHeight: (.*?)/;

// const CEL_AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBbGxvdyI6WyJwdWJsaWMiLCJyZWFkIiwid3JpdGUiLCJhZG1pbiJdfQ.nC-rmjFCQOZkXVaug_Btozp0A1Kta4idiKd7UebCHA8';

export default (
  url: string,
  options: {
    method: string,
    params: any[]
  },
  callback: (err: Error | string | null, celestiaResponse?: any) => void
) => {
  if (!isURL(url))
    return callback('bad_request');

  db.get('celestia_auth_key', (err, celestiaAuthKey) => {
    if (err && (err as any).code === 'LEVEL_NOT_FOUND')
      return callback('key_not_found');

    if (err)
      return callback(err);

    fetch(url, {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${celestiaAuthKey}`
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: options.method,
          params: options.params,
        })
    })
      .then(res => res.json())
      .then(res => {
        if (BLOCK_DATA_NOT_FOUND_ERROR_MESSAGE_REGEX.test(res.error?.message))
          return callback('block_not_found');

        if (SYNCING_IN_PROGRESS_ERROR_MESSAGE_REGEX.test(res.error?.message))
          return callback('syncing_in_progress');

        if (!res.result)
          return callback(null, {
            id: 1,
            jsonrpc: '2.0',
            result: []
          });
        else
          return callback(null, res);
      })
      .catch(_ => callback('fetch_error'));
  });
};

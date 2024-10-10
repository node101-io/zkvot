import isURL from '../../../utils/isURL.js';

const BLOCK_DATA_NOT_FOUND_ERROR_MESSAGE_REGEX: RegExp = /Block data not found/;
const INTERNAL_SERVER_ERROR_MESSAGE_REGEX: RegExp = /Internal Server Error/;
const BLOCK_NOT_FOUND_ERROR_MESSAGE_REGEX: RegExp= /Not Found/;

export default (
  url: string,
  options: {
    method: 'GET' | 'POST',
    submit_data?: any
  },
  callback: (err: string | null, availResponse?: any) => void
) => {
  if (!isURL(url))
    return callback('bad_request');

  fetch(url, {
    method: options.method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: options.method.trim() === 'GET' ? null : JSON.stringify({
      data: options.submit_data
    })
  })
    .then(res => {
      if (BLOCK_DATA_NOT_FOUND_ERROR_MESSAGE_REGEX.test(res.statusText))
        return callback(null, {
          block_number: null,
          data_transactions: []
        });

      if (INTERNAL_SERVER_ERROR_MESSAGE_REGEX.test(res.statusText))
        return callback('internal_server_error');

      if (BLOCK_NOT_FOUND_ERROR_MESSAGE_REGEX.test(res.statusText))
        return callback('block_not_found');

      return res.json().then(data => callback(null, data));
    })
    .catch(_ => callback('fetch_error'));
};

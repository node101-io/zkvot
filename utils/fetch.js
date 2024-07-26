const validator = require('validator');

const DATA_NOT_FOUND_ERROR_MESSAGE_REGEX = /blob: not found/;
const WALLET_NOT_FUNDED_ERROR_MESSAGE_REGEX = /account (.*?) not/;

module.exports = (url, options, callback) => {
  if (!url || !validator.isURL(url))
    return callback('bad_request');

  if (!options || typeof options != 'object')
    return callback('bad_request');

  fetch(url, options)
    .then(res => res.json())
    .then(res => {
      return callback(null, res);
    })
    .catch(err => {
      if (DATA_NOT_FOUND_ERROR_MESSAGE_REGEX.test(err))
        return callback('data_not_found');

      if (WALLET_NOT_FUNDED_ERROR_MESSAGE_REGEX.test(err))
        return callback('wallet_not_funded');

      return callback('fetch_error');
    });
};
import validator from "validator";

const FETCH_METHODS = [ 'GET', 'POST' ];

const BLOCK_DATA_NOT_AVAILABLE_ERROR_MESSAGE_REGEX = /"Block data"... is not valid JSON/;
const INTERNAL_SERVER_ERROR_MESSAGE_REGEX = /"Internal S"... is not valid JSON/;
const NOT_FOUND_ERROR_MESSAGE_REGEX = /"Not Found" is not valid JSON/;

export default (url, options, callback) => {
  if (!url || !validator.isURL(url.toString()))
    return callback('bad_request');

  if (!options || typeof options != 'object')
    return callback('bad_request');

  if (!options.method || !FETCH_METHODS.includes(options.method.trim()))
    return callback('bad_request');

  fetch(url, {
    method: options.method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: options.method.trim() == 'GET' ? null : JSON.stringify({
      data: options.submit_data
    })
  })
    .then(res => res.json())
    .then(res => {
      return callback(null, res);
    })
    .catch(err => {
      if (BLOCK_DATA_NOT_AVAILABLE_ERROR_MESSAGE_REGEX.test(err))
        return callback('block_data_not_available');

      if (INTERNAL_SERVER_ERROR_MESSAGE_REGEX.test(err))
        return callback('internal_server_error');

      if (NOT_FOUND_ERROR_MESSAGE_REGEX.test(err))
        return callback('not_found');

      return callback('fetch_error');
    });
};
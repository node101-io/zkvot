const validator = require('validator');

const availRequest = require('./availRequest');

module.exports = (rpc_url, callback) => {
  if (!rpc_url || !validator.isURL(rpc_url.toString()))
    return callback('bad_request');

  availRequest(`${rpc_url}/v2/status`, {
      method: 'GET'
    }, (err, res) => {
      if (err)
        return callback(null, false);

      return callback(null, true);
    }
  );
};
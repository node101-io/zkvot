const validator = require('../../../utils/validator');

const write = require('../../../utils/da-layers/avail/write');

module.exports = (data, callback) => {
  if (!validator(data, { required: true, type: "object" })) return callback('bad_request');
  if (!validator(data.proof, { required: true, type: "string" })) return callback('bad_request');

  write(data, (error, result) => {
    if (error) return callback(error);

    if (!validator(result, { required: true, type: "object" })) return callback('da_layer_error');

    return callback(null, result);
  });
};
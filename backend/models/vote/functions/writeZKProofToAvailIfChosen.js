const validator = require('../../../utils/validator');

const write = require('../../../utils/da-layers/avail/write');

module.exports = (data, callback) => {
  if (!validator(data, { required: true, type: 'object' })) return callback('bad_request');
  if (!validator(data.da_layer, { required: true, type: 'string' })) return callback('bad_request');
  if (!validator(data.proof, { required: true, type: 'object' })) return callback('bad_request');

  if (data.da_layer !== 'avail')
    return callback(null);

  if (!validator(data.app_id, { required: true, type: 'number' })) return callback('bad_request');

  write(data.app_id, data.proof, (error, availResult) => {
    if (error) return callback(error);

    if (!validator(availResult, { required: true, type: 'object' })) return callback('da_layer_error');

    return callback(null, availResult);
  });
};

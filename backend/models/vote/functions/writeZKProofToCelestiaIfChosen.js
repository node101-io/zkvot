const isBase64String = require('../../../utils/isBase64String');
const validator = require('../../../utils/validator');

const write = require('../../../utils/da-layers/celestia/write');

module.exports = (data, callback) => {
  if (!validator(data, { required: true, type: 'object' })) return callback('bad_request');
  if (!validator(data.da_layer, { required: true, type: 'string' })) return callback('bad_request');
  if (!validator(data.proof, { required: true, type: 'object' })) return callback('bad_request');

  if (data.da_layer !== 'celestia')
    return callback(null);

  if (!isBase64String(data.namespace)) return callback('bad_request');

  write(data.namespace, data.proof, (error, celestiaResult) => {
    if (error) return callback(error);

    if (!validator(celestiaResult, { required: true, type: 'object' })) return callback('da_layer_error');

    return callback(null, celestiaResult);
  });
};

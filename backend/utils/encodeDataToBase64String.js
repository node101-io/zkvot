const validator = require('./validator');

module.exports = (data, callback) => {
  if (!validator(data, { required: true, type: "object" }))
    return callback('bad_request');

  try {
    const dataString = JSON.stringify(data);
    const encodedData = Buffer.from(dataString).toString('base64');
    return callback(null, encodedData);
  } catch (err) {
    return callback(err);
  };
};

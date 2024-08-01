module.exports = (data, callback) => {
  if (!data || typeof data != 'object')
    return callback('bad_request');

  const dataString = JSON.stringify(data);

  const encodedData = Buffer.from(dataString).toString('base64');

  return callback(null, encodedData);
};
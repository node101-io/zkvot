import isBase64String from "./isBase64String.js";

export default (encodedData, callback) => {
  if (!isBase64String(encodedData))
    return callback('bad_request');

  try {
    const decodedData = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf8'));

    return callback(null, decodedData);
  } catch (err) {
    return callback('bad_request');
  };
};
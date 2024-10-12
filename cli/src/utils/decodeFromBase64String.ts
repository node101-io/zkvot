import { JsonProof } from 'o1js';

import isBase64String from './isBase64String.js';

export default (
  base64String: string,
  callback: (err: string | null, decodedData?: JsonProof) => void
) => {
  if (!isBase64String(base64String))
    return callback('bad_request');

  try {
    const decodedResult: JsonProof = JSON.parse(Buffer.from(base64String, 'base64').toString('utf8'));

    return callback(null, decodedResult);
  } catch (err) {
    return callback('bad_request');
  };
};

import isBase64String from './isBase64String.js';
export default (base64String, callback) => {
    if (!isBase64String(base64String))
        return callback('bad_request');
    try {
        const decodedResult = JSON.parse(Buffer.from(base64String, 'base64').toString('utf8'));
        return callback(null, decodedResult);
    }
    catch (err) {
        return callback('bad_request');
    }
    ;
};
//# sourceMappingURL=decodeFromBase64String.js.map
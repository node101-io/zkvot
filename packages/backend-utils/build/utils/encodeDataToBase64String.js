export default (data, callback) => {
    try {
        const dataString = JSON.stringify(data);
        const encodedData = Buffer.from(dataString).toString('base64');
        return callback(null, encodedData);
    }
    catch (err) {
        return callback(err.toString());
    }
    ;
};
//# sourceMappingURL=encodeDataToBase64String.js.map
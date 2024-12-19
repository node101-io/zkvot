export default (data, is_devnet, callback) => {
    // TEST
    return callback(null, { blockHeight: 1, txHash: '' });
    // if (data.da_layer == 'Avail') {
    //   if (!data.app_id)
    //     return callback('bad_request');
    //   writeToAvail(data.submission_data, is_devnet, (err, availResult) => {
    //     if (err)
    //       return callback(err);
    //     if (!availResult)
    //       return callback('bad_request');
    //     return callback(null, availResult);
    //   });
    // } else if (data.da_layer == 'Celestia') {
    //   if (!data.namespace)
    //     return callback('bad_request');
    //   writeToCelestia(data.namespace, data.submission_data, is_devnet, (err, celestiaResult) => {
    //     if (err)
    //       return callback(err);
    //     if (!celestiaResult)
    //       return callback('bad_request');
    //     return callback(null, {
    //       txHash: '',
    //       blockHeight: Number(celestiaResult.blockHeight)
    //     });
    //   });
    // } else {
    //   return callback('impossible_error')
    // };
};
//# sourceMappingURL=submitVote.js.map
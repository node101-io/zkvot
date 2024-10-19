const { Keyring, WaitFor } = require('avail-js-sdk');

const encodeDataToBase64String = require('../../encodeDataToBase64String');

const ClientConfig = require('./ClientConfig');
const getSDK = require('./getSDK');

module.exports = (app_id, zkProof, callback) => {
  getSDK((error, sdk) => {
    if (error || !sdk) return callback('rpc_connection_error');

    const userAccount = new Keyring({ type: 'sr25519' }).addFromUri(ClientConfig.seedPhrase);

    encodeDataToBase64String(zkProof, (error, encodedZkProof) => {
      if (error) return callback(error);

      sdk.tx.dataAvailability.submitData(encodedZkProof,
        WaitFor.BlockInclusion,
        userAccount,
        { app_id: app_id }
      )
      .then(result => {
        if (!result.isErr) {
          return callback(null, {
            blockHeight: Number(result.blockNumber),
            txHash: result.txHash.toString()
          });
        }
      })
      .catch(_ => callback('da_layer_error'));
    });
  });
};

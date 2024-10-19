const { Keyring, WaitFor } = require('avail-js-sdk');

const ClientConfig = require('./ClientConfig');
const getSDK = require('./getSDK');


module.exports = async (data, callback) => {
  getSDK((error, sdk) => {
    if (error || !sdk) return callback('rpc_connection_error');

    const userAccount = new Keyring({ type: "sr25519" }).addFromUri(ClientConfig.seedPhrase);
    const appID = ClientConfig.appID == 0 ? 1 : ClientConfig.appID;

    sdk.tx.dataAvailability.submitData(data, 
      WaitFor.BlockInclusion, 
      userAccount, 
      { app_id: appID })
      .then(result => { 
        if (!result.isErr) {
          return callback(null, {
            blockHash: result.blockHash.toString(),
            txHash: result.txHash.toString()
          });
        }
      })
      .catch(err => {
        return callback('da_layer_error');
      });
    });
}
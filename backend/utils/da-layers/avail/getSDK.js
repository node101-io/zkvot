const { SDK } = require("avail-js-sdk");

const ClientConfig = require('./ClientConfig');
 
let initializedSDK = null;

module.exports = (callback) => {
  if (initializedSDK) {
    return callback(null, initializedSDK);
  }

  SDK.New(ClientConfig.rpcEndpoint)
    .then(sdk => {
      initializedSDK = sdk;
      console.log('SDK initialized');

      return callback(null, sdk);
    })
    .catch((error) => {
      console.error('SDK initialization failed');

      return callback('rpc_connection_error')
    });
};

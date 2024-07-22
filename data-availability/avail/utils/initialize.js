const { initialize, getKeyringFromSeed } = require('avail-js-sdk');
const clientConfig = require('../clientConfig');

module.exports = async () => {
  const initializedAPI = await initialize(clientConfig.rpc_url);
  const clientAccount = getKeyringFromSeed(clientConfig.seed_phrase);
  const appID = clientConfig.app_id == 0 ? 1 : clientConfig.app_id;
  const options = { app_id: appID, nonce: -1 };

  return {
    initializedAPI,
    clientAccount,
    options
  };
};
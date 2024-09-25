const { ApiPromise, WsProvider } = require('@polkadot/api');

const address = require('./address');

const AVAIL_WS_PROVIDER_ADDRESS = 'wss://turing-testnet.avail-rpc.com';

module.exports = callback => {
  address((err, address) => {
    if (err)
      return callback(err);

    const availWsProvider = new WsProvider(AVAIL_WS_PROVIDER_ADDRESS);

    ApiPromise.create({ provider: availWsProvider })
      .then(api => api.query.system.account(address))
      .then(accountInfo => {
        const { free } = accountInfo.data;

        availWsProvider.disconnect();

        return callback(null, free.toString());
      })
      .catch(err => {
        availWsProvider.disconnect();

        return callback('rpc_error');
      });
  });
};
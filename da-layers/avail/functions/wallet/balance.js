const address = require('./address');

const { ApiPromise, WsProvider } = require('@polkadot/api');

module.exports = callback => {
  address((err, address) => {
    if (err)
      return callback(err);

    const availWsProvider = new WsProvider(process.env.AVAIL_WS_PROVIDER_ADDRESS);

    ApiPromise.create({ provider: availWsProvider })
      .then(api => api.query.system.account(address))
      .then(accountInfo => {
        const { free } = accountInfo.data;

        availWsProvider.disconnect();

        return callback(null, free.toString());
      })
      .catch(err => {
        availWsProvider.disconnect();

        return callback(err);
      });
  });
};
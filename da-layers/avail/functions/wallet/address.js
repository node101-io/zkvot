const { getKeyringFromSeed } = require('avail-js-sdk');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

const SafeStore = require('../../../../utils/safeStore');

module.exports = callback => {
  cryptoWaitReady()
    .then(_ => getKeyringFromSeed(SafeStore.getAvailMnemonic()))
    .then(res => {
      return callback(null, res.address);
    })
    .catch(err => {
      return callback(err);
    });
};
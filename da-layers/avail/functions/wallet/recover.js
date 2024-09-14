const childProcess = require('child_process');
const { mnemonicValidate } = require('@polkadot/util-crypto');

const address = require('./address');

const SafeStore = require('../../../../utils/safeStore');

const ADD_NEW_MNEMONIC_TO_NODE_COMMAND = data => `
  docker exec zkvote-node-avail bash -c 'sed -i "s|^avail_secret_uri = .*$|avail_secret_uri = \\"${data.mnemonic}\\"|" $DAEMON_HOME/$CHAIN_ID/identity/identity.toml'
`;

module.exports = (data, callback) => {
  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.mnemonic || typeof data.mnemonic != 'string' || !data.mnemonic.trim().length || !mnemonicValidate(data.mnemonic))
    return callback('bad_request');

  childProcess.exec(
    ADD_NEW_MNEMONIC_TO_NODE_COMMAND(data),
    (err, stderr, stdout) => {
      if (err)
        return callback('terminal_error');

      console.log(stderr, stdout);

      SafeStore.keepAvailMnemonic(data.mnemonic, err => {
        if (err)
          return callback(err);

        address((err, address) => {
          if (err)
            return callback(err);

          return callback(null, {
            address
          });
        });
      });
    }
  );
};
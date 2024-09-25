const childProcess = require('child_process');
const { mnemonicGenerate } = require('@polkadot/util-crypto');

const address = require('./address');

const SafeStore = require('../../../../utils/safeStore');

const ADD_NEW_MNEMONIC_TO_NODE_COMMAND = data => `
  docker exec zkvote-node-avail bash -c 'sed -i "s|^avail_secret_uri = .*$|avail_secret_uri = \\"${data.mnemonic}\\"|" $DAEMON_HOME/$CHAIN_ID/identity/identity.toml'
`;
const DEFAULT_MNEMONIC_LENGTH = 24;

module.exports = callback => {
  const mnemonic = mnemonicGenerate(DEFAULT_MNEMONIC_LENGTH);

  childProcess.exec(
    ADD_NEW_MNEMONIC_TO_NODE_COMMAND({ mnemonic }),
    (err, stderr, stdout) => {
      if (err)
        return callback('terminal_error');

      console.log(stderr, stdout);

      SafeStore.keepAvailMnemonic(mnemonic, err => {
        if (err)
          return callback(err);

        address((err, address) => {
          if (err)
            return callback(err);

          return callback(null, {
            address,
            mnemonic
          });
        });
      });
    }
  );
};
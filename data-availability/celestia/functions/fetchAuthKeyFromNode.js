const childProcess = require('child_process');

const GET_AUTH_KEY_COMMAND = `
  docker exec zkvote-node-celestia bash -c 'celestia $NODE_TYPE auth admin --p2p.network $CHAIN_ID'
`;

/**
 * @callback fetchAuthKeyFromNodeCallback
 * @param {string|null} err
 * @param {string|null} authKey
 */

/**
 * @param {fetchAuthKeyFromNodeCallback} callback
 * @returns {void}
 */
module.exports = callback => {
  childProcess.exec(
    GET_AUTH_KEY_COMMAND,
    (err, authKey) => {
      if (err)
        return callback('terminal_error');

      return callback(null, authKey.trim());
    }
  );
};
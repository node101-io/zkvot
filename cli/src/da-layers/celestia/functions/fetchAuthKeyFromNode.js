import child_process from 'child_process';

const GET_AUTH_KEY_COMMAND = `
  docker exec zkvote-node-celestia bash -c 'celestia $NODE_TYPE auth admin --p2p.network $CHAIN_ID'
`;

export default callback => {
  child_process.exec(
    GET_AUTH_KEY_COMMAND,
    (err, authKey) => {
      if (err)
        return callback('terminal_error');

      return callback(null, authKey.trim());
    }
  );
};
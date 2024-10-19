import childProcess from 'child_process';

const GET_AUTH_KEY_COMMAND: string = `
  docker exec zkvote-node-celestia bash -c 'celestia $NODE_TYPE auth admin --p2p.network $CHAIN_ID'
`;

export default (callback: (err: string | null, authKey?: string) => void) => {
  childProcess.exec(
    GET_AUTH_KEY_COMMAND,
    (err, key) => {
      if (err)
        return callback('terminal_error');

      return callback(null, key.trim());
    }
  );
};

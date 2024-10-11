import net from 'net';

const DEFAULT_RPC_URL: string = '127.0.0.1';

export default (
  port: number,
  callback: (err: string | null, inUse?: boolean) => void
): void => {
  const socket = new net.Socket();
  socket.setTimeout(500);

  socket.on('connect', () => {
    socket.destroy();
    return callback(null, true);
  });

  socket.on('timeout', () => {
    socket.destroy();
    return callback(null, false);
  });

  socket.on('error', (err: any) => {
    socket.destroy();
    if (err.code === 'ECONNREFUSED') {
      return callback(null, false);
    } else {
      return callback(null, true);
    };
  });

  socket.connect(port, DEFAULT_RPC_URL);
};

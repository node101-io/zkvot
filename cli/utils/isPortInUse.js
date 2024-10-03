import net from 'net';

const DEFAULT_RPC_URL = '127.0.0.1';

export default (port, callback) => {
  if (!port || isNaN(port) || Number(port) < 0)
    return callback('bad_request');

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

  socket.on('error', err => {
    socket.destroy();
    if (err.code == 'ECONNREFUSED')
      return callback(null, false);
    else
      return callback(null, true);
  });

  socket.connect(port, DEFAULT_RPC_URL);
};
// if (!process.env.CELESTIA_TESTNET_AUTH_TOKEN)
//   console.warn('CELESTIA_TESTNET_AUTH_TOKEN environment variable not set');
// if (!process.env.CELESTIA_MAINNET_AUTH_TOKEN)
//   console.warn('CELESTIA_MAINNET_AUTH_TOKEN environment variable not set');

export const testnet = {
  authToken: process.env.CELESTIA_TESTNET_AUTH_TOKEN,
  defaultTxFee: process.env.CELESTIA_TESTNET_DEFAULT_TX_FEE || 0.002,
  rpcEndpoint: process.env.CELESTIA_TESTNET_RPC_ENDPOINT || 'http://127.0.0.1:10102'
};

export const mainnet = {
  authToken: process.env.CELESTIA_MAINNET_AUTH_TOKEN,
  defaultTxFee: process.env.CELESTIA_MAINNET_DEFAULT_TX_FEE || 0.002,
  rpcEndpoint: process.env.CELESTIA_MAINNET_RPC_ENDPOINT || 'http://127.0.0.1:10103'
};

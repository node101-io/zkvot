if (!process.env.AVAIL_SEED_PHRASE_TESTNET)
  console.warn('AVAIL_SEED_PHRASE_TESTNET environment variable not set');
if (!process.env.AVAIL_SEED_PHRASE_MAINNET)
  console.warn('AVAIL_SEED_PHRASE_MAINNET environment variable not set');

export const mainnet = {
  seedPhrase: process.env.AVAIL_SEED_PHRASE_MAINNET,
  rpcEndpoint: process.env.AVAIL_RPC_ENDPOINT_MAINNET || 'https://mainnet-rpc.avail.so/rpc',
  providerEndpoint: process.env.AVAIL_PROVIDER_ENDPOINT_MAINNET || 'wss://mainnet.avail-rpc.com',
  appID: 101
};

export const devnet = {
  seedPhrase: process.env.AVAIL_SEED_PHRASE_DEVNET,
  rpcEndpoint: process.env.AVAIL_RPC_ENDPOINT_DEVNET || 'https://turing-rpc.avail.so/rpc',
  providerEndpoint: process.env.AVAIL_PROVIDER_ENDPOINT_DEVNET || 'wss://turing-rpc.avail.so/ws',
  appID: 101
};

if (!process.env.AVAIL_LIGHT_CLIENT_SEED_PHRASE)
  console.error('AVAIL_LIGHT_CLIENT_SEED_PHRASE environment variable not set');

export const seedPhrase = process.env.AVAIL_LIGHT_CLIENT_SEED_PHRASE;
export const rpcEndpoint = process.env.AVAIL_LIGHT_CLIENT_RPC_ENDPOINT || 'https://api.lightclient.mainnet.avail.so';
export const appID = 101;

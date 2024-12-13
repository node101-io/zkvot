import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(import.meta.dirname, '../../../../.env') });

if (!process.env.AVAIL_SEED_PHRASE_MAINNET)
  console.warn('AVAIL_SEED_PHRASE_MAINNET environment variable not set');
if (!process.env.AVAIL_SEED_PHRASE_DEVNET)
  console.warn('AVAIL_SEED_PHRASE_DEVNET environment variable not set');

export const mainnet = {
  seedPhrase: process.env.AVAIL_SEED_PHRASE_MAINNET,
  rpcEndpoint: process.env.AVAIL_RPC_ENDPOINT_MAINNET || 'https://turing-rpc.avail.so/rpc',
  providerEndpoint: process.env.AVAIL_PROVIDER_ENDPOINT_MAINNET || 'wss://turing-rpc.avail.so/ws',
  appID: 101
};

export const devnet = {
  seedPhrase: process.env.AVAIL_SEED_PHRASE_DEVNET,
  rpcEndpoint: process.env.AVAIL_RPC_ENDPOINT_MAINNET || 'https://mainnet-rpc.avail.so/rpc',
  providerEndpoint: process.env.AVAIL_PROVIDER_ENDPOINT_DEVNET || 'wss://mainnet.avail-rpc.com',
  appID: 101
};
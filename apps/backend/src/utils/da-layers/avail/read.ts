import { Keyring } from 'avail-js-sdk';

import { types } from 'zkvot-core';

import { getSDK } from './sdk.js';
import { devnet, mainnet } from './config.js';

export default async (
  height: number,
  is_devnet: boolean,
  callback: (
    error: string | null,
    submission_data_list?: types.DaLayerSubmissionData[]
  ) => any
) => {
  const seedPhrase = is_devnet ? devnet.seedPhrase : mainnet.seedPhrase;
  const appID = is_devnet ? devnet.appID : mainnet.appID;

  try {
    if (!seedPhrase || !appID)
      return callback('not_authenticated_request');
  
    const sdk = await getSDK(is_devnet)
   
    const account = new Keyring({ type: 'sr25519' }).addFromUri(seedPhrase)
   
    const hash = (await sdk.api.rpc.chain.getBlockHash(height));
    const result = await sdk.api.rpc.chain.getBlock(hash);
    const txs = result.block.extrinsics.map(each => {
      return (each as any).appId
    });

    console.log(txs.length);

  } catch (error) {
    console.error(error);
    return callback('read_error');
  };
};

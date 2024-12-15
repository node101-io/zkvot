import { WaitFor, Keyring } from 'avail-js-sdk';

import { types } from 'zkvot-core';

import { getSDK } from './sdk.js';
import { devnet, mainnet } from './config.js';

export default async (
  data: types.DaLayerSubmissionData,
  is_devnet: boolean,
  callback: (
    error: string | null,
    data?: {
      blockHeight: number;
      txHash: string;
    }
  ) => any
) => {
  const seedPhrase = is_devnet ? devnet.seedPhrase : mainnet.seedPhrase;
  const appID = is_devnet ? devnet.appID : mainnet.appID;

  try {
    if (!seedPhrase || !appID)
      return callback('not_authenticated_request');

    const sdk = await getSDK(is_devnet)

    const account = new Keyring({ type: 'sr25519' }).addFromUri(seedPhrase);

    const submissionResult = await sdk.tx.dataAvailability.submitData(
      JSON.stringify(data),
      WaitFor.BlockInclusion,
      account,
      { app_id: appID }
    );

    if (submissionResult.isErr)
      return callback('submit_error');

    return callback(null, {
      blockHeight: submissionResult.blockNumber,
      txHash: submissionResult.txHash.toString()
    });
  } catch (error) {
    console.error(error);
    return callback('submit_error');
  };
};

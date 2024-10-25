import { Keyring, WaitFor } from 'avail-js-sdk';

import encodeDataToBase64String from '../../encodeDataToBase64String.js';

import ClientConfig from './ClientConfig.js';
import getSDK from './getSDK.js';

export default (
  app_id: any,
  zkProof: object,
  callback: (
    error: string | null,
    data?: {
      blockHeight: number;
      txHash: string;
    }
  ) => any
) => {
  getSDK((error, sdk) => {
    if (error || !sdk) return callback('rpc_connection_error');

    const userAccount = new Keyring({ type: 'sr25519' }).addFromUri(ClientConfig.seedPhrase);

    encodeDataToBase64String(zkProof, (error, encodedZkProof) => {
      if (error) return callback(error);

      sdk.tx.dataAvailability
        .submitData(encodedZkProof,
          WaitFor.BlockInclusion,
          userAccount,
          { app_id: app_id }
        )
        .then(( result: {
          isErr: any;
          blockNumber: any;
          txHash: { toString: () => any; };
        }) => {
          if (result.isErr)
            return callback('da_layer_error');

          return callback(null, {
            blockHeight: Number(result.blockNumber),
            txHash: result.txHash.toString()
          });
        })
        .catch((_: any) => callback('da_layer_error'));
    });
  });
};

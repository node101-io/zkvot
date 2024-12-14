import { getSDK } from './sdk.js';
import { devnet, mainnet } from './config.js';

export default async (
  height: number,
  is_devnet: boolean,
  callback: (
    error: string | null,
    submission_data_list?: { appId: number; data: string }[]
  ) => any
) => {
  let submission_data_list = [];
  const defaultAppId = is_devnet ? devnet.appID : mainnet.appID;

  try {
    if (!defaultAppId)
      return callback('not_authenticated_request');

    const sdk = await getSDK(is_devnet);

    const blockHash = await sdk.api.rpc.chain.getBlockHash(height);
    const signedBlock = await sdk.api.rpc.chain.getBlock(blockHash);

    const extrinsics = signedBlock.block.extrinsics;

    const submitDataTransactions = extrinsics.filter((extrinsic) => {
      try {
        const { method } = extrinsic;
        return method.section === 'dataAvailability' && method.method === 'submitData';
      } catch (err) {
        return callback('da_tx_error');
      };
    });

    for (let i = 0; i < submitDataTransactions.length; i++) {
      const extrinsic = submitDataTransactions[i];

      try {
        const submittedDataAppId = Number((extrinsic as any).__internal__raw.signature.appId);

        if (submittedDataAppId === defaultAppId) {
          const data = String(extrinsic.method.args[0].toHuman() || '');

          submission_data_list.push({ appId: submittedDataAppId, data: data });
        }
      } catch (err) {
        return callback('extrinsic_error');
      }
    }

    const result = submission_data_list.length > 0 ? submission_data_list : undefined;

    return callback(null, result);
  } catch (error) {
    return callback('read_error');
  };
};

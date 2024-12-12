import encodeDataToBase64String from '../../encodeDataToBase64String.js';
import { rpcEndpoint } from './config.js';

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
  encodeDataToBase64String(zkProof, async (error, encodedZkProof) => {
    if (error) return callback(error);

    try {
      const body = JSON.stringify({
        data: encodedZkProof,
        app_id: app_id,
      });

      const response = await fetch(`${rpcEndpoint}/v2/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      if (response.ok) {
        const data = await response.json();
        const { block_number, hash } = data;

        return callback(null, {
          blockHeight: block_number,
          txHash: hash,
        });
      } else {
        return callback('da_layer_error');
      }
    } catch (err) {
      return callback('rpc_connection_error');
    }
  });
};

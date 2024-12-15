import { types } from 'zkvot-core';

import encodeDataToBase64String from '../../encodeDataToBase64String.js';

import { mainnet, testnet } from './config.js';

const WALLET_NOT_FUNDED_ERROR_MESSAGE_REGEX: RegExp = /account (.*?) not found/;

export default (
  namespace: string,
  data: types.DaLayerSubmissionData,
  is_devnet: boolean,
  callback: (
    err: string | null,
    data?: { blockHeight: number | null; }
  ) => any
) => {
  const celestiaNetwork = is_devnet ? testnet : mainnet;

  if (!celestiaNetwork.localEndpoint || !celestiaNetwork.authToken)
    return callback('not_authenticated_request');

  encodeDataToBase64String(data, (err, encodedData) => {
    if (err)
      return callback(err);
    if (!encodedData)
      return callback('bad_request');

    fetch(celestiaNetwork.localEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${celestiaNetwork.authToken}`
      },
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'blob.Submit',
        params: [
          [
            {
              namespace: namespace.trim(),
              data: encodedData.trim()
            }
          ],
          {
            gas_price: celestiaNetwork.defaultTxFee,
            is_gas_price_set: true
          }
        ]
      })
    })
    .then(res => res.json())
    .then(jsonRes => {
      if (WALLET_NOT_FUNDED_ERROR_MESSAGE_REGEX.test(jsonRes.error?.message))
        return callback('wallet_not_funded');

      if (!jsonRes.result)
        return callback(null, {
          blockHeight: null
        });
      else
        return callback(null, {
          blockHeight: jsonRes.result
        });
    })
    .catch(_ => callback('write_error'));
  });
};

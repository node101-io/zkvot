import { types } from 'zkvot-core';

import encodeDataToBase64String from '../../encodeDataToBase64String.js';

import config from './config.js';

const NAMESPACE_NOT_LEGAL_BASE64_ERROR_MESSAGE_REGEX: RegExp = /illegal base64 data at input byte (.*?)/;
const NAMESPACE_NOT_SUPPORTED_ERROR_MESSAGE_REGEX: RegExp = /invalid namespace: unsupported namespace (.*?)/;
const WALLET_NOT_FUNDED_ERROR_MESSAGE_REGEX: RegExp = /account (.*?) not found/;

export default (
  namespace: string,
  data: types.DaLayerSubmissionData,
  is_devnet: boolean,
  callback: (
    err: string | null,
    data?: {
      blockHeight: number;
      txHash: string;
    }
  ) => any
) => {
  const celestiaNetwork = is_devnet ? config.testnet : config.mainnet;

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
        method: 'state.SubmitPayForBlob',
        params: [
          [
            {
              namespace_id: namespace.trim(),
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
      if (NAMESPACE_NOT_LEGAL_BASE64_ERROR_MESSAGE_REGEX.test(jsonRes.error?.message))
        return callback('namespace_not_legal_base64');

      if (NAMESPACE_NOT_SUPPORTED_ERROR_MESSAGE_REGEX.test(jsonRes.error?.message))
        return callback('namespace_not_supported');

      if (WALLET_NOT_FUNDED_ERROR_MESSAGE_REGEX.test(jsonRes.error?.message))
        return callback('wallet_not_funded');

      if (!jsonRes.result)
        return callback(null, {
          blockHeight: 0,
          txHash: ''
        });
      else
        return callback(null, {
          blockHeight: jsonRes.result?.height,
          txHash: jsonRes.result?.txhash
        });
    })
    .catch(_ => callback('write_error'));
  });
};

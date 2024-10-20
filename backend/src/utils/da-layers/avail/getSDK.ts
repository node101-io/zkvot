import { SDK } from 'avail-js-sdk';

import ClientConfig from './ClientConfig';
 
let initializedSDK = null;

export default (
  callback: (error: string | null, data?: any) => any
) => {
  if (initializedSDK)
    return callback(null, initializedSDK);

  SDK
    .New(ClientConfig.rpcEndpoint)
    .then((sdk: any) => {
      initializedSDK = sdk;
      return callback(null, sdk);
    })
    .catch(_ => {
      return callback('rpc_connection_error')
    });
};

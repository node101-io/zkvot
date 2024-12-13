import { SDK, WaitFor, Keyring } from 'avail-js-sdk';

import { devnet, mainnet } from './config.js';

let devnet_sdk: SDK | null = null;
let mainnet_sdk: SDK | null = null;

export const getSDK = async (is_devnet: boolean) => {
  if (is_devnet) {
    if (!devnet_sdk?.api.isConnected)
      devnet_sdk = await SDK.New(devnet.providerEndpoint);
  
    return devnet_sdk;
  } else {
    if (!mainnet_sdk?.api.isConnected)
      mainnet_sdk = await SDK.New(mainnet.providerEndpoint);
  
    return mainnet_sdk;
  }
};
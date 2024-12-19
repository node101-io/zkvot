import { SDK, WaitFor, Keyring } from 'avail-js-sdk';

import config from './config.js';

let devnet_sdk: SDK | null = null;
let mainnet_sdk: SDK | null = null;

export default async (is_devnet: boolean) => {
  if (is_devnet) {
    if (!devnet_sdk?.api.isConnected)
      devnet_sdk = await SDK.New(config.devnet.providerEndpoint);

    return devnet_sdk;
  } else {
    if (!mainnet_sdk?.api.isConnected)
      mainnet_sdk = await SDK.New(config.mainnet.providerEndpoint);

    return mainnet_sdk;
  }
};

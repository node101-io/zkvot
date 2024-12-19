import { SDK } from 'avail-js-sdk';
import config from './config.js';
let devnet_sdk = null;
let mainnet_sdk = null;
export default async (is_devnet) => {
    if (is_devnet) {
        if (!devnet_sdk?.api.isConnected)
            devnet_sdk = await SDK.New(config.devnet.providerEndpoint);
        return devnet_sdk;
    }
    else {
        if (!mainnet_sdk?.api.isConnected)
            mainnet_sdk = await SDK.New(config.mainnet.providerEndpoint);
        return mainnet_sdk;
    }
};
//# sourceMappingURL=sdk.js.map
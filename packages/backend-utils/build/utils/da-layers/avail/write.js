import encodeDataToBase64String from '../../encodeDataToBase64String.js';
import { WaitFor, Keyring } from 'avail-js-sdk';
import getSDK from './sdk.js';
import config from './config.js';
export default async (data, is_devnet, callback) => {
    const seedPhrase = is_devnet ? config.devnet.seedPhrase : config.mainnet.seedPhrase;
    const appID = is_devnet ? config.devnet.appID : config.mainnet.appID;
    try {
        if (!seedPhrase || !appID)
            return callback('not_authenticated_request');
        const sdk = await getSDK(is_devnet);
        const account = new Keyring({ type: 'sr25519' }).addFromUri(seedPhrase);
        encodeDataToBase64String(data, async (err, encodedData) => {
            if (err)
                return callback(err);
            if (!encodedData)
                return callback('bad_request');
            const submissionResult = await sdk.tx.dataAvailability.submitData(encodedData, WaitFor.BlockInclusion, account, { app_id: appID });
            if (submissionResult.isErr)
                return callback('submit_error');
            return callback(null, {
                blockHeight: submissionResult.blockNumber,
                txHash: submissionResult.txHash.toString()
            });
        });
    }
    catch (error) {
        console.error(error);
        return callback('submit_error');
    }
    ;
};
//# sourceMappingURL=write.js.map
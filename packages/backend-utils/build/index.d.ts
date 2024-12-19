import Election from './models/election/Election.js';
import ResultProof from './models/result-proof/ResultProof.js';
import Vote from './models/vote/Vote.js';
declare const utils: {
    aggregate: (data: Object, callback: Function) => void;
    decodeFromBase64String: (base64String: string, callback: (err: string | null, decodedData?: any) => void) => void;
    encodeDataToBase64String: (data: object, callback: (error: string | null, base64String?: string) => any) => any;
    generateRandomHex: (length?: number) => string;
    isBase64String: (data: string) => boolean;
    avail: {
        write: (data: import("zkvot-core").types.DaLayerSubmissionData, is_devnet: boolean, callback: (error: string | null, data?: {
            blockHeight: number;
            txHash: string;
        }) => any) => Promise<any>;
        read: (height: number, is_devnet: boolean, callback: (error: string | null, submission_data_list?: {
            appId: number;
            data: string;
        }[]) => any) => Promise<any>;
        getSDK: (is_devnet: boolean) => Promise<import("avail-js-sdk").SDK>;
        config: {
            mainnet: {
                seedPhrase: string | undefined;
                rpcEndpoint: string;
                providerEndpoint: string;
                appID: number;
            };
            devnet: {
                seedPhrase: string | undefined;
                rpcEndpoint: string;
                providerEndpoint: string;
                appID: number;
            };
        };
    };
    celestia: {
        write: (namespace: string, data: import("zkvot-core").types.DaLayerSubmissionData, is_devnet: boolean, callback: (err: string | null, data?: {
            blockHeight: number | null;
        }) => any) => any;
        read: (height: number, namespace: string, is_devnet: boolean, callback: (error: string | null, submission_data_list?: {
            namespace: string;
            data: string;
        }[]) => any) => any;
        config: {
            testnet: {
                authToken: string | undefined;
                defaultTxFee: string | number;
                localEndpoint: string;
                rpcEndpoint: string;
            };
            mainnet: {
                authToken: string | undefined;
                defaultTxFee: string | number;
                localEndpoint: string;
                rpcEndpoint: string;
            };
        };
    };
};
export { Election, ResultProof, Vote, utils };

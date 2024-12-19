import { types } from 'zkvot-core';
declare const _default: (data: {
    submission_data: types.DaLayerSubmissionData;
    da_layer: types.DaLayerInfo["name"];
    namespace?: string;
    app_id?: number;
}, is_devnet: boolean, callback: (error: string | null, result?: {
    blockHeight: number;
    txHash: string;
}) => any) => any;
export default _default;

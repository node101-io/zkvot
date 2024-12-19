import { types } from 'zkvot-core';
declare const _default: (data: types.DaLayerSubmissionData, is_devnet: boolean, callback: (error: string | null, data?: {
    blockHeight: number;
    txHash: string;
}) => any) => Promise<any>;
export default _default;

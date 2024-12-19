import { Model } from 'mongoose';
import { types } from 'zkvot-core';
type VoteType = {
    election_contract_id: string;
    nullifier: string;
    da_layer: types.DaLayerInfo['name'];
    block_height: number;
    tx_hash: string;
    proof: string;
    is_counted: boolean;
};
interface VoteStatics {
    createVote: (data: {
        is_devnet: boolean;
        da_layer_submission_data: types.DaLayerSubmissionData;
        election_contract_id: string;
        da_layer: types.DaLayerInfo['name'];
    }, callback: (error: string | null, vote?: VoteType) => any) => any;
    createAndSubmitVote: (data: {
        is_devnet: boolean;
        da_layer_submission_data: types.DaLayerSubmissionData;
        election_contract_id: string;
        da_layer: types.DaLayerInfo['name'];
    }, callback: (error: string | null, vote?: VoteType) => any) => any;
    countOldestUncountedVote: (callback: (error: string | null, vote?: VoteType) => any) => any;
    countVotesRecursively: () => any;
}
declare const Vote: Model<any> & VoteStatics;
export default Vote;

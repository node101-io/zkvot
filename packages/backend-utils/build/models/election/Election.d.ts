import { Model } from 'mongoose';
import { JsonProof } from 'o1js';
import { types } from 'zkvot-core';
type ResultProofType = {
    mina_contract_id: string;
    proof: string;
    previous_voters: {
        vote: number;
        nullifier: string;
    }[];
};
interface ElectionStatics {
    createElection: (data: {
        mina_contract_id: string;
        is_devnet?: boolean;
    }, callback: (error: string | null, election?: types.ElectionBackendData) => any) => any;
    findOrCreateElectionByContractId: (data: {
        mina_contract_id: string;
        is_devnet?: boolean;
    }, callback: (error: string | null, election?: types.ElectionBackendData) => any) => any;
    findElectionsByFilter: (data: {
        is_devnet?: boolean;
        skip?: number;
        text?: string;
        start_after?: Date;
        end_before?: Date;
        is_ongoing?: boolean;
    }, callback: (error: string | null, elections?: types.ElectionBackendData[]) => any) => any;
    findElectionByContractIdAndGetProof: (mina_contract_id: string, callback: (error: string | null, proof?: ResultProofType) => any) => any;
    findElectionByContractIdAndAddVote: (data: {
        mina_contract_id: string;
        proof: JsonProof;
        new_voter: {
            vote: number;
            nullifier: string;
        };
    }, callback: (error: string | null) => any) => any;
    findElectionByContractIdAndGetResults: (mina_contract_id: string, callback: (error: string | null, data?: {
        result: {
            name: string;
            percentage: number;
            voteCount: string;
        }[];
        proof: string;
    }) => any) => any;
}
declare const Election: Model<any> & ElectionStatics;
export default Election;

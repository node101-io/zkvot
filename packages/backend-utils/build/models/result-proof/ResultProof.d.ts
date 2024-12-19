import { Model } from 'mongoose';
import { JsonProof } from 'o1js';
type ResultProofType = {
    mina_contract_id: string;
    proof: string;
    previous_voters: {
        vote: number;
        nullifier: string;
    }[];
};
interface ResultProofStatics {
    createOrFindResultProofByMinaContractId: (data: {
        mina_contract_id: string;
    }, callback: (error: string | null, proof?: ResultProofType) => any) => any;
    findResultProofByMinaContractIdAndUpdate: (data: {
        mina_contract_id: string;
        proof: JsonProof;
        new_voter: {
            vote: number;
            nullifier: string;
        };
    }, callback: (error: string | null) => any) => Promise<any>;
}
declare const ResultProof: Model<any> & ResultProofStatics;
export default ResultProof;

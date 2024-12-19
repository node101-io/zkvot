import { JsonProof } from 'o1js';
declare const _default: (data: {
    vote: JsonProof;
    electionPubKey: string;
    merkleRoot: string;
}, callback: (error: string | null, result?: {
    nullifier: string;
    vote: number;
}) => any) => any;
export default _default;

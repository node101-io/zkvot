import { JsonProof, verify } from 'o1js';
import { VoteProof, Vote } from 'contracts';

const { verificationKey } = await Vote.compile();

export default (
  data: {
    vote: JsonProof;
    electionId: string;
    merkleRoot: bigint;
  },
  callback: (error: string | null, nullifier?: undefined | bigint) => any
) => {
  if (!verificationKey)
    return callback('proof_not_compiled');

  VoteProof
    .fromJSON(data.vote)
    .then(async (voteProof) => {
      if (voteProof.publicInput.votersRoot.toBigInt() != data.merkleRoot)
        return callback('invalid_proof');

      if (voteProof.publicInput.electionId.toBase58() != data.electionId)
        return callback('invalid_proof');

      if (!(await verify(voteProof, verificationKey)))
        return callback('invalid_proof');

      return callback(null, voteProof.publicOutput.nullifier.toBigInt());
    })
    .catch(_ => callback('invalid_proof'));
};

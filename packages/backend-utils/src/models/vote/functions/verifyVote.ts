import { JsonProof, verify } from 'o1js';

import { Vote } from 'zkvot-core';

export default (
  data: {
    vote: JsonProof;
    electionPubKey: string;
    merkleRoot: string;
  },
  callback: (error: string | null, result?: {
    nullifier: string;
    vote: number;
  }) => any
) => {
  if (!Vote.verificationKey)
    return callback('try_again_in_a_few_minutes');

  Vote.Proof
    .fromJSON(data.vote)
    .catch(_ => callback('invalid_vote'))
    .then(async (voteProof) => {
      if (voteProof.publicInput.votersRoot.toBigInt().toString() !== data.merkleRoot)
        return callback('invalid_vote');

      if (voteProof.publicInput.electionPubKey.toBase58() !== data.electionPubKey)
        return callback('invalid_vote');

      if (!(await verify(voteProof, Vote.verificationKey)))
        return callback('invalid_vote');

      return callback(null, {
        nullifier: voteProof.publicOutput.nullifier.toBigInt().toString(),
        vote: voteProof.publicOutput.vote.toBigInt().toString(),
      });
    });
};

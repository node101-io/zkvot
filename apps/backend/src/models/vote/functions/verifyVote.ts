import { JsonProof, verify } from 'o1js';

import { Vote } from 'zkvot-core';

import { getVerificationKey } from '../../../utils/compileZkProgram.js';

export default (
  data: {
    vote: JsonProof;
    electionId: string;
    merkleRoot: string;
  },
  callback: (error: string | null, nullifier?: undefined | bigint) => any
) => {
  const verificationKey = getVerificationKey();

  if (!verificationKey)
    return callback('try_again_in_a_few_minutes');

  Vote.Proof
    .fromJSON(data.vote)
    .catch(_ => callback('invalid_vote'))
    .then(async (voteProof) => {
      if (voteProof.publicInput.votersRoot.toBigInt().toString() !== data.merkleRoot)
        return callback('invalid_vote');

      if (voteProof.publicInput.electionId.toBase58() !== data.electionId)
        return callback('invalid_vote');

      if (!(await verify(voteProof, verificationKey)))
        return callback('invalid_vote');

      return callback(null, voteProof.publicOutput.nullifier.toBigInt());
    });
};

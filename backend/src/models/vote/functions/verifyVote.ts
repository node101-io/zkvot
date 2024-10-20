import { JsonProof } from 'o1js';

import { VoteProof } from '../../../utils/zk-proofs/vote';

export default (
  data: {
    vote: JsonProof;
    merkleRoot: bigint;
  },
  callback: (error: string | null, nullifier?: undefined | bigint) => any
) => {
  VoteProof
    .fromJSON(data.vote)
    .then(voteProof => {
      voteProof.verify();

      if (voteProof.publicInput.votersRoot.toBigInt() != data.merkleRoot)
        return callback('invalid_proof');

      return callback(null, voteProof.publicOutput.nullifier.toBigInt());
    })
    .catch(err => callback('invalid_proof'));
};
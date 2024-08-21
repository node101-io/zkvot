import {
  assert,
  Experimental,
  Field,
  Provable,
  SelfProof,
  Struct,
  ZkProgram,
} from 'o1js';

import { VoteProof } from './NewVote.js';

class MerkleMap extends Experimental.IndexedMerkleMap(30) {}

export class VoteAggregatorPublicInputs extends Struct({
  votersRoot: Field,
  votedMapRoot: Field,
  voteId: Field,
}) {}

export class VoteAggregatorPublicOutputs extends Struct({
  totalAggregatedCount: Field,
  newVotedTreeRoot: Field,
  yeys: Field,
  nays: Field,
}) {}

export const VoteAggregator = ZkProgram({
  name: 'VoteAggregator',
  publicInput: VoteAggregatorPublicInputs,
  publicOutput: VoteAggregatorPublicOutputs,

  methods: {
    base: {
      privateInputs: [],
      async method(publicInput: VoteAggregatorPublicInputs) {
        let merkleMap = new MerkleMap();
        let defaultRoot = merkleMap.root;
        return {
          totalAggregatedCount: Field.from(0),
          newVotedTreeRoot: defaultRoot,
          yeys: Field.from(0),
          nays: Field.from(0),
        };
      },
    },
    aggregateVotes: {
      privateInputs: [SelfProof, VoteProof, MerkleMap],
      async method(
        publicInput: VoteAggregatorPublicInputs,
        previousProof: SelfProof<
          VoteAggregatorPublicInputs,
          VoteAggregatorPublicOutputs
        >,
        vote: VoteProof,
        votedMap: MerkleMap
      ) {
        previousProof.verify();

        vote.verify();
        // console.log(2);

        previousProof.publicInput.voteId.assertEquals(publicInput.voteId);
        // console.log(3);
        previousProof.publicInput.votersRoot.assertEquals(
          publicInput.votersRoot
        );
        // console.log(4);
        previousProof.publicOutput.newVotedTreeRoot.assertEquals(
          publicInput.votedMapRoot
        );
        // console.log(5);
        vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
        // console.log(6);
        vote.publicInput.votingId.assertEquals(publicInput.voteId);
        // console.log(7);
        votedMap.length.assertEquals(
          previousProof.publicOutput.totalAggregatedCount.add(1)
        );
        // console.log(8);
        votedMap.root.assertEquals(publicInput.votedMapRoot);
        // console.log(9, votedMap.root);
        votedMap.insert(vote.publicOutput.nullifier, vote.publicOutput.vote);
        // console.log(10);
        const newRoot = votedMap.root;
        // console.log(11);
        // const totalAggregatedCount = previousProof.publicOutput.yeys.add(
        //   previousProof.publicOutput.nays
        // );

        // previousProof.publicOutput.totalAggregatedCount.assertEquals(
        //   totalAggregatedCount
        // );

        const yeys = Provable.if(
          vote.publicOutput.vote.equals(Field.from(2)),
          previousProof.publicOutput.yeys.add(1),
          previousProof.publicOutput.yeys
        );
        // console.log(12);
        const nays = Provable.if(
          vote.publicOutput.vote.equals(Field.from(1)),
          previousProof.publicOutput.nays.add(1),
          previousProof.publicOutput.nays
        );
        // console.log(13);

        return {
          totalAggregatedCount:
            previousProof.publicOutput.totalAggregatedCount.add(1),
          newVotedTreeRoot: newRoot,
          yeys: yeys,
          nays: nays,
        };
      },
    },
  },
});

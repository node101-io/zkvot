import {
  Field,
  MerkleMap,
  MerkleMapWitness,
  Provable,
  SelfProof,
  Struct,
  ZkProgram,
} from 'o1js';
import { VoteProof } from './NewVote.js';

export class VoteAggregatorPublicInputs extends Struct({
  votersRoot: Field,
  voteId: Field,
  previousVotedTreeRoot: Field,
  merkleWitness: MerkleMapWitness,
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
        let defaultRoot = merkleMap.getRoot();
        return {
          totalAggregatedCount: Field.from(0),
          newVotedTreeRoot: defaultRoot,
          yeys: Field.from(0),
          nays: Field.from(0),
        };
      },
    },
    aggregateVotes: {
      privateInputs: [SelfProof, VoteProof],
      async method(
        publicInput: VoteAggregatorPublicInputs,
        previousProof: SelfProof<
          VoteAggregatorPublicInputs,
          VoteAggregatorPublicOutputs
        >,
        vote: VoteProof
      ) {
        previousProof.verify();

        vote.verify();

        previousProof.publicInput.voteId.assertEquals(publicInput.voteId);
        previousProof.publicInput.votersRoot.assertEquals(
          publicInput.votersRoot
        );

        previousProof.publicOutput.newVotedTreeRoot.assertEquals(
          publicInput.previousVotedTreeRoot
        );

        vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
        vote.publicInput.votingId.assertEquals(publicInput.voteId);

        let [calculatedRoot, calculatedKey] =
          publicInput.merkleWitness.computeRootAndKeyV2(Field.from(0));

        publicInput.previousVotedTreeRoot.assertEquals(calculatedRoot);
        vote.publicOutput.identifierHash.assertEquals(calculatedKey);

        let [newRoot, newKey] = publicInput.merkleWitness.computeRootAndKeyV2(
          vote.publicOutput.vote
        );

        newKey.assertEquals(calculatedKey); // is it necessary?

        const totalAggregatedCount = previousProof.publicOutput.yeys.add(
          previousProof.publicOutput.nays
        );

        previousProof.publicOutput.totalAggregatedCount.assertEquals(
          totalAggregatedCount
        );

        const yeys = Provable.if(
          vote.publicOutput.vote.equals(Field.from(2)),
          previousProof.publicOutput.yeys.add(1),
          previousProof.publicOutput.yeys
        );
        const nays = Provable.if(
          vote.publicOutput.vote.equals(Field.from(1)),
          previousProof.publicOutput.nays.add(1),
          previousProof.publicOutput.nays
        );

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

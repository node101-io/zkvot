import {
  Field,
  MerkleMap,
  MerkleMapWitness,
  PublicKey,
  SelfProof,
  Struct,
  ZkProgram,
} from 'o1js';

import Vote from './Vote.js';

namespace AggregationMerkleMapNamespace {
  export class PublicInputs extends Struct({
    votersRoot: Field,
    electionPubKey: PublicKey,
  }) {}

  export class PublicOutputs extends Struct({
    totalAggregatedCount: Field,
    merkleMapRoot: Field,
    voteOptions_1: Field,
    voteOptions_2: Field,
    voteOptions_3: Field,
  }) {}

  export const Program = ZkProgram({
    name: 'AggregationProgram',
    publicInput: PublicInputs,
    publicOutput: PublicOutputs,

    methods: {
      base_empty: {
        privateInputs: [],
        async method() {
          const merkleMapRoot = new MerkleMap().getRoot();
          return {
            publicOutput: {
              totalAggregatedCount: Field.from(0),
              merkleMapRoot: merkleMapRoot,
              voteOptions_1: Field.from(0),
              voteOptions_2: Field.from(0),
              voteOptions_3: Field.from(0),
            },
          };
        },
      },
      base_one: {
        privateInputs: [Vote.Proof],
        async method(publicInput: PublicInputs, vote: Vote.Proof) {
          vote.verify();

          vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
          vote.publicInput.electionPubKey.assertEquals(
            publicInput.electionPubKey
          );

          const nullifier = vote.publicOutput.nullifier;

          const newVoteOptions = Vote.VoteOptions.empty().addVote(vote);

          const merkleMap = new MerkleMap();
          merkleMap.set(nullifier, vote.publicOutput.vote);
          const root = merkleMap.getRoot();

          return {
            publicOutput: {
              totalAggregatedCount: Field.from(1),
              merkleMapRoot: root,
              voteOptions_1: newVoteOptions.voteOptions_1,
              voteOptions_2: newVoteOptions.voteOptions_2,
              voteOptions_3: newVoteOptions.voteOptions_3,
            },
          };
        },
      },
      base_two: {
        privateInputs: [Vote.Proof, Vote.Proof],
        async method(
          publicInput: PublicInputs,
          lowerVote: Vote.Proof,
          upperVote: Vote.Proof
        ) {
          lowerVote.verify();
          upperVote.verify();

          lowerVote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
          upperVote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
          lowerVote.publicInput.electionPubKey.assertEquals(
            publicInput.electionPubKey
          );
          upperVote.publicInput.electionPubKey.assertEquals(
            publicInput.electionPubKey
          );

          const lowerNullifier = lowerVote.publicOutput.nullifier;
          const upperNullifier = upperVote.publicOutput.nullifier;

          lowerNullifier.assertLessThan(upperNullifier);

          const merkleMap = new MerkleMap();
          merkleMap.set(lowerNullifier, lowerVote.publicOutput.vote);
          merkleMap.set(upperNullifier, upperVote.publicOutput.vote);

          const root = merkleMap.getRoot();
          const newVoteOptions = Vote.VoteOptions.empty()
            .addVote(lowerVote)
            .addVote(upperVote);

          return {
            publicOutput: {
              totalAggregatedCount: Field.from(2),
              merkleMapRoot: root,
              voteOptions_1: newVoteOptions.voteOptions_1,
              voteOptions_2: newVoteOptions.voteOptions_2,
              voteOptions_3: newVoteOptions.voteOptions_3,
            },
          };
        },
      },
      append_vote: {
        privateInputs: [SelfProof, Vote.Proof, MerkleMapWitness],
        async method(
          publicInput: PublicInputs,
          previousProof: SelfProof<PublicInputs, PublicOutputs>,
          vote: Vote.Proof,
          merkleMapWitness: MerkleMapWitness
        ) {
          previousProof.verify();
          previousProof.publicInput.electionPubKey.assertEquals(
            publicInput.electionPubKey
          );
          previousProof.publicInput.votersRoot.assertEquals(
            publicInput.votersRoot
          );

          vote.verify();

          vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
          vote.publicInput.electionPubKey.assertEquals(
            publicInput.electionPubKey
          );
          const nullifier = vote.publicOutput.nullifier;

          // const previousLowerBound = previousProof.publicOutput.rangeLowerBound;
          // const previousUpperBound = previousProof.publicOutput.rangeUpperBound;
          // previousLowerBound.assertGreaterThan(nullifier);

          const [currentRoot, currentKey] = merkleMapWitness.computeRootAndKey(
            Field.from(0)
          );
          currentKey.assertEquals(nullifier);
          currentRoot.assertEquals(previousProof.publicOutput.merkleMapRoot);

          const [newRoot, newKey] = merkleMapWitness.computeRootAndKey(
            vote.publicOutput.vote
          );

          const newVoteOptions = new Vote.VoteOptions({
            voteOptions_1: previousProof.publicOutput.voteOptions_1,
            voteOptions_2: previousProof.publicOutput.voteOptions_2,
            voteOptions_3: previousProof.publicOutput.voteOptions_3,
          }).addVote(vote);

          return {
            publicOutput: {
              totalAggregatedCount:
                previousProof.publicOutput.totalAggregatedCount.add(1),
              merkleMapRoot: newRoot,
              voteOptions_1: newVoteOptions.voteOptions_1,
              voteOptions_2: newVoteOptions.voteOptions_2,
              voteOptions_3: newVoteOptions.voteOptions_3,
            },
          };
        },
      },
    },
  });

  export class Proof extends ZkProgram.Proof(Program) {}
}

export default AggregationMerkleMapNamespace;

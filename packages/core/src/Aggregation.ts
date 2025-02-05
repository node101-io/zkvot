import { Field, PublicKey, SelfProof, Struct, ZkProgram } from 'o1js';

import Vote from './Vote.js';

namespace AggregationNamespace {
  export class PublicInputs extends Struct({
    votersRoot: Field,
    electionPubKey: PublicKey,
  }) {}

  export class PublicOutputs extends Struct({
    totalAggregatedCount: Field,
    rangeLowerBound: Field,
    rangeUpperBound: Field,
    voteOptions: Vote.VoteOptions,
  }) {}

  export const Program = ZkProgram({
    name: 'AggregationProgram',
    publicInput: PublicInputs,
    publicOutput: PublicOutputs,

    methods: {
      base_empty: {
        privateInputs: [Field, Field],
        async method(
          publicInput: PublicInputs,
          lowerBound: Field,
          upperBound: Field
        ) {
          return {
            publicOutput: {
              totalAggregatedCount: Field.from(0),
              rangeLowerBound: lowerBound,
              rangeUpperBound: upperBound,
              voteOptions: Vote.VoteOptions.empty(),
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

          return {
            publicOutput: {
              totalAggregatedCount: Field.from(1),
              rangeLowerBound: nullifier,
              rangeUpperBound: nullifier,
              voteOptions: newVoteOptions,
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

          const newVoteOptions = Vote.VoteOptions.empty()
            .addVote(lowerVote)
            .addVote(upperVote);

          return {
            publicOutput: {
              totalAggregatedCount: Field.from(2),
              rangeLowerBound: lowerNullifier,
              rangeUpperBound: upperNullifier,
              voteOptions: newVoteOptions,
            },
          };
        },
      },
      append_left: {
        privateInputs: [SelfProof, Vote.Proof],
        async method(
          publicInput: PublicInputs,
          previousProof: SelfProof<PublicInputs, PublicOutputs>,
          vote: Vote.Proof
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

          const previousLowerBound = previousProof.publicOutput.rangeLowerBound;
          const previousUpperBound = previousProof.publicOutput.rangeUpperBound;

          const nullifier = vote.publicOutput.nullifier;

          previousLowerBound.assertGreaterThan(nullifier);

          const newVoteOptions =
            previousProof.publicOutput.voteOptions.addVote(vote);

          return {
            publicOutput: {
              totalAggregatedCount:
                previousProof.publicOutput.totalAggregatedCount.add(1),
              rangeLowerBound: nullifier,
              rangeUpperBound: previousUpperBound,
              voteOptions: newVoteOptions,
            },
          };
        },
      },
      append_right: {
        privateInputs: [SelfProof, Vote.Proof],
        async method(
          publicInput: PublicInputs,
          previousProof: SelfProof<PublicInputs, PublicOutputs>,
          vote: Vote.Proof
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

          const previousLowerBound = previousProof.publicOutput.rangeLowerBound;
          const previousUpperBound = previousProof.publicOutput.rangeUpperBound;

          const nullifier = vote.publicOutput.nullifier;

          previousUpperBound.assertLessThan(nullifier);

          const newVoteOptions =
            previousProof.publicOutput.voteOptions.addVote(vote);

          return {
            publicOutput: {
              totalAggregatedCount:
                previousProof.publicOutput.totalAggregatedCount.add(1),
              rangeLowerBound: previousLowerBound,
              rangeUpperBound: nullifier,
              voteOptions: newVoteOptions,
            },
          };
        },
      },
      merge: {
        privateInputs: [SelfProof, SelfProof],
        async method(
          publicInput: PublicInputs,
          leftProof: SelfProof<PublicInputs, PublicOutputs>,
          rightProof: SelfProof<PublicInputs, PublicOutputs>
        ) {
          leftProof.verify();
          rightProof.verify();

          leftProof.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
          rightProof.publicInput.votersRoot.assertEquals(
            publicInput.votersRoot
          );
          leftProof.publicInput.electionPubKey.assertEquals(
            publicInput.electionPubKey
          );
          rightProof.publicInput.electionPubKey.assertEquals(
            publicInput.electionPubKey
          );

          const leftLowerBound = leftProof.publicOutput.rangeLowerBound;
          const leftUpperBound = leftProof.publicOutput.rangeUpperBound;
          const rightLowerBound = rightProof.publicOutput.rangeLowerBound;
          const rightUpperBound = rightProof.publicOutput.rangeUpperBound;

          leftUpperBound.assertLessThan(rightLowerBound);

          const newVoteOptions = leftProof.publicOutput.voteOptions.merge(
            rightProof.publicOutput.voteOptions
          );

          return {
            publicOutput: {
              totalAggregatedCount:
                leftProof.publicOutput.totalAggregatedCount.add(
                  rightProof.publicOutput.totalAggregatedCount
                ),
              rangeLowerBound: leftLowerBound,
              rangeUpperBound: rightUpperBound,
              voteOptions: newVoteOptions,
            },
          };
        },
      },
    },
  });

  export class Proof extends ZkProgram.Proof(Program) {}
}

export default AggregationNamespace;

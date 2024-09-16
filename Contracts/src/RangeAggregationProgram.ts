import { Field, Provable, SelfProof, Struct, ZkProgram } from 'o1js';

import { VoteProof } from './VoteProgram.js';

export class RangeAggregationPublicInputs extends Struct({
  votersRoot: Field,
  voteId: Field,
}) {}

export class RangeAggregationPublicOutputs extends Struct({
  totalAggregatedCount: Field,
  rangeLowerBound: Field,
  rangeUpperBound: Field,
  yeys: Field,
  nays: Field,
}) {}

export const RangeAggregationProgram = ZkProgram({
  name: 'RangeAggregationProgram',
  publicInput: RangeAggregationPublicInputs,
  publicOutput: RangeAggregationPublicOutputs,

  methods: {
    base_empty: {
      privateInputs: [Field, Field],
      async method(
        publicInput: RangeAggregationPublicInputs,
        lowerBound: Field,
        upperBound: Field
      ) {
        return {
          totalAggregatedCount: Field.from(0),
          rangeLowerBound: lowerBound,
          rangeUpperBound: upperBound,
          yeys: Field.from(0),
          nays: Field.from(0),
        };
      },
    },
    base_one: {
      privateInputs: [VoteProof],
      async method(publicInput: RangeAggregationPublicInputs, vote: VoteProof) {
        vote.verify();

        vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);

        const nullifier = vote.publicOutput.nullifier;

        const yeys = Provable.if(
          vote.publicOutput.vote.equals(Field.from(2)),
          Field.from(1),
          Field.from(0)
        );

        const nays = Provable.if(
          vote.publicOutput.vote.equals(Field.from(1)),
          Field.from(1),
          Field.from(0)
        );

        return {
          totalAggregatedCount: Field.from(1),
          rangeLowerBound: nullifier,
          rangeUpperBound: nullifier,
          yeys: yeys,
          nays: nays,
        };
      },
    },
    base_two: {
      privateInputs: [VoteProof, VoteProof],
      async method(
        publicInput: RangeAggregationPublicInputs,
        lowerVote: VoteProof,
        upperVote: VoteProof
      ) {
        lowerVote.verify();
        upperVote.verify();

        lowerVote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
        upperVote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);

        const lowerNullifier = lowerVote.publicOutput.nullifier;
        const upperNullifier = upperVote.publicOutput.nullifier;

        lowerNullifier.assertLessThan(upperNullifier);

        const yeys = Provable.if(
          lowerVote.publicOutput.vote.equals(Field.from(2)),
          Field.from(1),
          Field.from(0)
        ).add(
          Provable.if(
            upperVote.publicOutput.vote.equals(Field.from(2)),
            Field.from(1),
            Field.from(0)
          )
        );

        const nays = Provable.if(
          lowerVote.publicOutput.vote.equals(Field.from(1)),
          Field.from(1),
          Field.from(0)
        ).add(
          Provable.if(
            upperVote.publicOutput.vote.equals(Field.from(1)),
            Field.from(1),
            Field.from(0)
          )
        );

        return {
          totalAggregatedCount: Field.from(2),
          rangeLowerBound: lowerNullifier,
          rangeUpperBound: upperNullifier,
          yeys: yeys,
          nays: nays,
        };
      },
    },
    append_left: {
      privateInputs: [SelfProof, VoteProof],
      async method(
        publicInput: RangeAggregationPublicInputs,
        previousProof: SelfProof<
          RangeAggregationPublicInputs,
          RangeAggregationPublicOutputs
        >,
        vote: VoteProof
      ) {
        previousProof.verify();
        vote.verify();

        vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);

        const previousLowerBound = previousProof.publicOutput.rangeLowerBound;
        const previousUpperBound = previousProof.publicOutput.rangeUpperBound;

        const nullifier = vote.publicOutput.nullifier;

        previousLowerBound.assertGreaterThan(nullifier);

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
          rangeLowerBound: nullifier,
          rangeUpperBound: previousUpperBound,
          yeys: yeys,
          nays: nays,
        };
      },
    },
    append_right: {
      privateInputs: [SelfProof, VoteProof],
      async method(
        publicInput: RangeAggregationPublicInputs,
        previousProof: SelfProof<
          RangeAggregationPublicInputs,
          RangeAggregationPublicOutputs
        >,
        vote: VoteProof
      ) {
        previousProof.verify();
        vote.verify();

        vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);

        const previousLowerBound = previousProof.publicOutput.rangeLowerBound;
        const previousUpperBound = previousProof.publicOutput.rangeUpperBound;

        const nullifier = vote.publicOutput.nullifier;

        previousUpperBound.assertLessThan(nullifier);

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
          rangeLowerBound: previousLowerBound,
          rangeUpperBound: nullifier,
          yeys: yeys,
          nays: nays,
        };
      },
    },
    merge: {
      privateInputs: [SelfProof, SelfProof],
      async method(
        publicInput: RangeAggregationPublicInputs,
        leftProof: SelfProof<
          RangeAggregationPublicInputs,
          RangeAggregationPublicOutputs
        >,
        rightProof: SelfProof<
          RangeAggregationPublicInputs,
          RangeAggregationPublicOutputs
        >
      ) {
        leftProof.verify();
        rightProof.verify();

        leftProof.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
        rightProof.publicInput.votersRoot.assertEquals(publicInput.votersRoot);

        const leftLowerBound = leftProof.publicOutput.rangeLowerBound;
        const leftUpperBound = leftProof.publicOutput.rangeUpperBound;
        const rightLowerBound = rightProof.publicOutput.rangeLowerBound;
        const rightUpperBound = rightProof.publicOutput.rangeUpperBound;

        leftUpperBound.assertLessThan(rightLowerBound);

        const yeys = leftProof.publicOutput.yeys.add(
          rightProof.publicOutput.yeys
        );
        const nays = leftProof.publicOutput.nays.add(
          rightProof.publicOutput.nays
        );

        return {
          totalAggregatedCount: leftProof.publicOutput.totalAggregatedCount.add(
            rightProof.publicOutput.totalAggregatedCount
          ),
          rangeLowerBound: leftLowerBound,
          rangeUpperBound: rightUpperBound,
          yeys: yeys,
          nays: nays,
        };
      },
    },
  },
});

export class AggregateProof extends ZkProgram.Proof(RangeAggregationProgram) {}

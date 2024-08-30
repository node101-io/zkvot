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
    base: {
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
    capacity_1_append_left: {
      privateInputs: [SelfProof, VoteProof, Field],
      async method(
        publicInput: RangeAggregationPublicInputs,
        previousProof: SelfProof<
          RangeAggregationPublicInputs,
          RangeAggregationPublicOutputs
        >,
        vote: VoteProof,
        lowerBound: Field
      ) {
        previousProof.verify();
        vote.verify();

        vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);

        const previousLowerBound = previousProof.publicOutput.rangeLowerBound;
        const previousUpperBound = previousProof.publicOutput.rangeUpperBound;

        const nullifier = vote.publicOutput.nullifier;

        previousLowerBound.assertGreaterThan(nullifier);
        lowerBound.assertLessThanOrEqual(nullifier);

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
          rangeLowerBound: lowerBound,
          rangeUpperBound: previousUpperBound,
          yeys: yeys,
          nays: nays,
        };
      },
    },
    capacity_1_append_right: {
      privateInputs: [SelfProof, VoteProof, Field],
      async method(
        publicInput: RangeAggregationPublicInputs,
        previousProof: SelfProof<
          RangeAggregationPublicInputs,
          RangeAggregationPublicOutputs
        >,
        vote: VoteProof,
        upperBound: Field
      ) {
        previousProof.verify();
        vote.verify();

        vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);

        const previousLowerBound = previousProof.publicOutput.rangeLowerBound;
        const previousUpperBound = previousProof.publicOutput.rangeUpperBound;

        const nullifier = vote.publicOutput.nullifier;

        upperBound.assertGreaterThanOrEqual(nullifier);

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
          rangeUpperBound: upperBound,
          yeys: yeys,
          nays: nays,
        };
      },
    },
  },
});

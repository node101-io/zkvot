import { assert, Field, Provable, SelfProof, Struct, ZkProgram } from 'o1js';

import { VoteProof } from './NewVote.js';

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

export const linearAggregation = ZkProgram({
  name: 'linearAggregation',
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

        // Provable.asProver(() => {
        //   console.log(
        //     1,
        //     vote.publicInput.votersRoot.toBigInt(),
        //     publicInput.votersRoot.toBigInt()
        //   );
        // });
        vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);

        const previousLowerBound = previousProof.publicOutput.rangeLowerBound;
        const previousUpperBound = previousProof.publicOutput.rangeUpperBound;

        const nullifier = vote.publicOutput.nullifier;

        // Provable.asProver(() => {
        //   console.log(2, previousUpperBound.toBigInt(), nullifier.toBigInt());
        // });
        // previousUpperBound.assertLessThan(nullifier);

        // Provable.asProver(() => {
        //   console.log(3, upperBound.toBigInt(), nullifier.toBigInt());
        // });
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

        // Provable.asProver(() => {
        //   console.log(4, yeys.toBigInt(), nays.toBigInt());
        // });
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
    // capacity_2_append_left: {
    //   privateInputs: [SelfProof, VoteProof, VoteProof, Field],
    //   async method(
    //     publicInput: RangeAggregationPublicInputs,
    //     previousProof: SelfProof<
    //       RangeAggregationPublicInputs,
    //       RangeAggregationPublicOutputs
    //     >,
    //     lowerBoundVote: VoteProof,
    //     upperBoundVote: VoteProof,
    //     lowerBound: Field
    //   ) {
    //     previousProof.verify();
    //     lowerBoundVote.verify();
    //     upperBoundVote.verify();

    //     lowerBoundVote.publicInput.votersRoot.assertEquals(
    //       publicInput.votersRoot
    //     );
    //     upperBoundVote.publicInput.votersRoot.assertEquals(
    //       publicInput.votersRoot
    //     );

    //     const previousLowerBound = previousProof.publicOutput.rangeLowerBound;
    //     const previousUpperBound = previousProof.publicOutput.rangeUpperBound;

    //     const lowerBoundNullifier = lowerBoundVote.publicOutput.nullifier;
    //     const upperBoundNullifier = upperBoundVote.publicOutput.nullifier;

    //     previousLowerBound.assertGreaterThan(upperBoundNullifier);
    //     lowerBoundNullifier.assertLessThan(upperBoundNullifier);
    //     lowerBound.assertLessThanOrEqual(lowerBoundNullifier);

    //     let yeys = Provable.if(
    //       lowerBoundVote.publicOutput.vote.equals(Field.from(2)),
    //       previousProof.publicOutput.yeys.add(1),
    //       previousProof.publicOutput.yeys
    //     );

    //     yeys = Provable.if(
    //       upperBoundVote.publicOutput.vote.equals(Field.from(2)),
    //       yeys.add(1),
    //       yeys
    //     );

    //     let nays = Provable.if(
    //       lowerBoundVote.publicOutput.vote.equals(Field.from(1)),
    //       previousProof.publicOutput.nays.add(1),
    //       previousProof.publicOutput.nays
    //     );

    //     nays = Provable.if(
    //       upperBoundVote.publicOutput.vote.equals(Field.from(1)),
    //       nays.add(1),
    //       nays
    //     );

    //     return {
    //       totalAggregatedCount:
    //         previousProof.publicOutput.totalAggregatedCount.add(2),
    //       rangeLowerBound: lowerBound,
    //       rangeUpperBound: previousUpperBound,
    //       yeys: yeys,
    //       nays: nays,
    //     };
    //   },
    // },

    // capacity_2_append_right: {
    //   privateInputs: [SelfProof, VoteProof, VoteProof, Field],
    //   async method(
    //     publicInput: RangeAggregationPublicInputs,
    //     previousProof: SelfProof<
    //       RangeAggregationPublicInputs,
    //       RangeAggregationPublicOutputs
    //     >,
    //     lowerBoundVote: VoteProof,
    //     upperBoundVote: VoteProof,
    //     upperBound: Field
    //   ) {
    //     previousProof.verify();
    //     lowerBoundVote.verify();
    //     upperBoundVote.verify();

    //     lowerBoundVote.publicInput.votersRoot.assertEquals(
    //       publicInput.votersRoot
    //     );
    //     upperBoundVote.publicInput.votersRoot.assertEquals(
    //       publicInput.votersRoot
    //     );

    //     const previousLowerBound = previousProof.publicOutput.rangeLowerBound;
    //     const previousUpperBound = previousProof.publicOutput.rangeUpperBound;

    //     const lowerBoundNullifier = lowerBoundVote.publicOutput.nullifier;
    //     const upperBoundNullifier = upperBoundVote.publicOutput.nullifier;

    //     previousUpperBound.assertLessThan(lowerBoundNullifier);
    //     upperBoundNullifier.assertGreaterThan(lowerBoundNullifier);
    //     upperBound.assertGreaterThanOrEqual(upperBoundNullifier);

    //     let yeys = Provable.if(
    //       lowerBoundVote.publicOutput.vote.equals(Field.from(2)),
    //       previousProof.publicOutput.yeys.add(1),
    //       previousProof.publicOutput.yeys
    //     );

    //     yeys = Provable.if(
    //       upperBoundVote.publicOutput.vote.equals(Field.from(2)),
    //       yeys.add(1),
    //       yeys
    //     );

    //     let nays = Provable.if(
    //       lowerBoundVote.publicOutput.vote.equals(Field.from(1)),
    //       previousProof.publicOutput.nays.add(1),
    //       previousProof.publicOutput.nays
    //     );

    //     nays = Provable.if(
    //       upperBoundVote.publicOutput.vote.equals(Field.from(1)),
    //       nays.add(1),
    //       nays
    //     );

    //     return {
    //       totalAggregatedCount:
    //         previousProof.publicOutput.totalAggregatedCount.add(2),
    //       rangeLowerBound: previousLowerBound,
    //       rangeUpperBound: upperBound,
    //       yeys: yeys,
    //       nays: nays,
    //     };
    //   },
    // },
  },
});

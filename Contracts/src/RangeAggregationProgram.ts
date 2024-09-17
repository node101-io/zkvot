import { Field, Provable, SelfProof, Struct, UInt32, ZkProgram } from 'o1js';

import { VoteProof } from './VoteProgram.js';

export class VoteOptions extends Struct({
  option_1: UInt32,
  option_2: UInt32,
  option_3: UInt32,
  option_4: UInt32,
  option_5: UInt32,
  option_6: UInt32,
  option_7: UInt32,
}) {
  compress(): Field {
    const option_1 = this.option_1.value.toBits(32);
    const option_2 = this.option_2.value.toBits(32);
    const option_3 = this.option_3.value.toBits(32);
    const option_4 = this.option_4.value.toBits(32);
    const option_5 = this.option_5.value.toBits(32);
    const option_6 = this.option_6.value.toBits(32);
    const option_7 = this.option_7.value.toBits(32);
    return Field.fromBits([
      ...option_1,
      ...option_2,
      ...option_3,
      ...option_4,
      ...option_5,
      ...option_6,
      ...option_7,
    ]);
  }

  toUInt32(): UInt32[] {
    return [
      this.option_1,
      this.option_2,
      this.option_3,
      this.option_4,
      this.option_5,
      this.option_6,
      this.option_7,
    ];
  }

  static decompress(packed: Field) {
    const bits = packed.toBits(224);
    const option_1 = UInt32.from(0);
    option_1.value = Field.fromBits(bits.slice(0, 32));
    const option_2 = UInt32.from(0);
    option_2.value = Field.fromBits(bits.slice(32, 64));
    const option_3 = UInt32.from(0);
    option_3.value = Field.fromBits(bits.slice(64, 96));
    const option_4 = UInt32.from(0);
    option_4.value = Field.fromBits(bits.slice(96, 128));
    const option_5 = UInt32.from(0);
    option_5.value = Field.fromBits(bits.slice(128, 160));
    const option_6 = UInt32.from(0);
    option_6.value = Field.fromBits(bits.slice(160, 192));
    const option_7 = UInt32.from(0);
    option_7.value = Field.fromBits(bits.slice(192, 224));
    return new VoteOptions({
      option_1,
      option_2,
      option_3,
      option_4,
      option_5,
      option_6,
      option_7,
    });
  }
}

export class RangeAggregationPublicInputs extends Struct({
  votersRoot: Field,
  voteId: Field,
}) {}

export class RangeAggregationPublicOutputs extends Struct({
  totalAggregatedCount: Field,
  rangeLowerBound: Field,
  rangeUpperBound: Field,
  voteOptions_1: Field,
  voteOptions_2: Field,
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
          voteOptions_1: Field.from(0),
          voteOptions_2: Field.from(0),
        };
      },
    },
    base_one: {
      privateInputs: [VoteProof],
      async method(publicInput: RangeAggregationPublicInputs, vote: VoteProof) {
        vote.verify();

        vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);

        const nullifier = vote.publicOutput.nullifier;

        const option_1 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(1)),
          UInt32.from(1),
          UInt32.from(0)
        );

        const option_2 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(2)),
          UInt32.from(1),
          UInt32.from(0)
        );

        const option_3 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(3)),
          UInt32.from(1),
          UInt32.from(0)
        );

        const option_4 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(4)),
          UInt32.from(1),
          UInt32.from(0)
        );

        const option_5 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(5)),
          UInt32.from(1),
          UInt32.from(0)
        );

        const option_6 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(6)),
          UInt32.from(1),
          UInt32.from(0)
        );

        const option_7 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(7)),
          UInt32.from(1),
          UInt32.from(0)
        );

        const voteOptions_1 = new VoteOptions({
          option_1,
          option_2,
          option_3,
          option_4,
          option_5,
          option_6,
          option_7,
        }).compress();

        const option_8 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(8)),
          UInt32.from(1),
          UInt32.from(0)
        );

        const option_9 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(9)),
          UInt32.from(1),
          UInt32.from(0)
        );

        const option_10 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(10)),
          UInt32.from(1),
          UInt32.from(0)
        );

        const option_11 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(11)),
          UInt32.from(1),
          UInt32.from(0)
        );

        const option_12 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(12)),
          UInt32.from(1),
          UInt32.from(0)
        );

        const option_13 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(13)),
          UInt32.from(1),
          UInt32.from(0)
        );

        const option_14 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(14)),
          UInt32.from(1),
          UInt32.from(0)
        );

        const voteOptions_2 = new VoteOptions({
          option_1: option_8,
          option_2: option_9,
          option_3: option_10,
          option_4: option_11,
          option_5: option_12,
          option_6: option_13,
          option_7: option_14,
        }).compress();

        return {
          totalAggregatedCount: Field.from(1),
          rangeLowerBound: nullifier,
          rangeUpperBound: nullifier,
          voteOptions_1: voteOptions_1,
          voteOptions_2: voteOptions_2,
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

        const option_1 = Provable.if(
          lowerVote.publicOutput.vote.equals(Field.from(1)),
          UInt32.from(1),
          UInt32.from(0)
        ).add(
          Provable.if(
            upperVote.publicOutput.vote.equals(Field.from(1)),
            UInt32.from(1),
            UInt32.from(0)
          )
        );

        const option_2 = Provable.if(
          lowerVote.publicOutput.vote.equals(Field.from(2)),
          UInt32.from(1),
          UInt32.from(0)
        ).add(
          Provable.if(
            upperVote.publicOutput.vote.equals(Field.from(2)),
            UInt32.from(1),
            UInt32.from(0)
          )
        );

        const option_3 = Provable.if(
          lowerVote.publicOutput.vote.equals(Field.from(3)),
          UInt32.from(1),
          UInt32.from(0)
        ).add(
          Provable.if(
            upperVote.publicOutput.vote.equals(Field.from(3)),
            UInt32.from(1),
            UInt32.from(0)
          )
        );

        const option_4 = Provable.if(
          lowerVote.publicOutput.vote.equals(Field.from(4)),
          UInt32.from(1),
          UInt32.from(0)
        ).add(
          Provable.if(
            upperVote.publicOutput.vote.equals(Field.from(4)),
            UInt32.from(1),
            UInt32.from(0)
          )
        );

        const option_5 = Provable.if(
          lowerVote.publicOutput.vote.equals(Field.from(5)),
          UInt32.from(1),
          UInt32.from(0)
        ).add(
          Provable.if(
            upperVote.publicOutput.vote.equals(Field.from(5)),
            UInt32.from(1),
            UInt32.from(0)
          )
        );

        const option_6 = Provable.if(
          lowerVote.publicOutput.vote.equals(Field.from(6)),
          UInt32.from(1),
          UInt32.from(0)
        ).add(
          Provable.if(
            upperVote.publicOutput.vote.equals(Field.from(6)),
            UInt32.from(1),
            UInt32.from(0)
          )
        );

        const option_7 = Provable.if(
          lowerVote.publicOutput.vote.equals(Field.from(7)),
          UInt32.from(1),
          UInt32.from(0)
        ).add(
          Provable.if(
            upperVote.publicOutput.vote.equals(Field.from(7)),
            UInt32.from(1),
            UInt32.from(0)
          )
        );

        const voteOptions_1 = new VoteOptions({
          option_1,
          option_2,
          option_3,
          option_4,
          option_5,
          option_6,
          option_7,
        }).compress();

        const option_8 = Provable.if(
          lowerVote.publicOutput.vote.equals(Field.from(8)),
          UInt32.from(1),
          UInt32.from(0)
        ).add(
          Provable.if(
            upperVote.publicOutput.vote.equals(Field.from(8)),
            UInt32.from(1),
            UInt32.from(0)
          )
        );

        const option_9 = Provable.if(
          lowerVote.publicOutput.vote.equals(Field.from(9)),
          UInt32.from(1),
          UInt32.from(0)
        ).add(
          Provable.if(
            upperVote.publicOutput.vote.equals(Field.from(9)),
            UInt32.from(1),
            UInt32.from(0)
          )
        );

        const option_10 = Provable.if(
          lowerVote.publicOutput.vote.equals(Field.from(10)),
          UInt32.from(1),
          UInt32.from(0)
        ).add(
          Provable.if(
            upperVote.publicOutput.vote.equals(Field.from(10)),
            UInt32.from(1),
            UInt32.from(0)
          )
        );

        const option_11 = Provable.if(
          lowerVote.publicOutput.vote.equals(Field.from(11)),
          UInt32.from(1),
          UInt32.from(0)
        ).add(
          Provable.if(
            upperVote.publicOutput.vote.equals(Field.from(11)),
            UInt32.from(1),
            UInt32.from(0)
          )
        );

        const option_12 = Provable.if(
          lowerVote.publicOutput.vote.equals(Field.from(12)),
          UInt32.from(1),
          UInt32.from(0)
        ).add(
          Provable.if(
            upperVote.publicOutput.vote.equals(Field.from(12)),
            UInt32.from(1),
            UInt32.from(0)
          )
        );

        const option_13 = Provable.if(
          lowerVote.publicOutput.vote.equals(Field.from(13)),
          UInt32.from(1),
          UInt32.from(0)
        ).add(
          Provable.if(
            upperVote.publicOutput.vote.equals(Field.from(13)),
            UInt32.from(1),
            UInt32.from(0)
          )
        );

        const option_14 = Provable.if(
          lowerVote.publicOutput.vote.equals(Field.from(14)),
          UInt32.from(1),
          UInt32.from(0)
        ).add(
          Provable.if(
            upperVote.publicOutput.vote.equals(Field.from(14)),
            UInt32.from(1),
            UInt32.from(0)
          )
        );

        const voteOptions_2 = new VoteOptions({
          option_1: option_8,
          option_2: option_9,
          option_3: option_10,
          option_4: option_11,
          option_5: option_12,
          option_6: option_13,
          option_7: option_14,
        }).compress();

        return {
          totalAggregatedCount: Field.from(2),
          rangeLowerBound: lowerNullifier,
          rangeUpperBound: upperNullifier,
          voteOptions_1: voteOptions_1,
          voteOptions_2: voteOptions_2,
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

        const voteOptions_1 = VoteOptions.decompress(
          previousProof.publicOutput.voteOptions_1
        );
        const voteOptions_2 = VoteOptions.decompress(
          previousProof.publicOutput.voteOptions_2
        );

        const option_1 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(1)),
          voteOptions_1.option_1.add(UInt32.from(1)),
          voteOptions_1.option_1
        );

        const option_2 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(2)),
          voteOptions_1.option_2.add(UInt32.from(1)),
          voteOptions_1.option_2
        );

        const option_3 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(3)),
          voteOptions_1.option_3.add(UInt32.from(1)),
          voteOptions_1.option_3
        );

        const option_4 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(4)),
          voteOptions_1.option_4.add(UInt32.from(1)),
          voteOptions_1.option_4
        );

        const option_5 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(5)),
          voteOptions_1.option_5.add(UInt32.from(1)),
          voteOptions_1.option_5
        );

        const option_6 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(6)),
          voteOptions_1.option_6.add(UInt32.from(1)),
          voteOptions_1.option_6
        );

        const option_7 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(7)),
          voteOptions_1.option_7.add(UInt32.from(1)),
          voteOptions_1.option_7
        );

        const voteOptions_1_new = new VoteOptions({
          option_1,
          option_2,
          option_3,
          option_4,
          option_5,
          option_6,
          option_7,
        }).compress();

        const option_8 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(8)),
          voteOptions_2.option_1.add(UInt32.from(1)),
          voteOptions_2.option_1
        );

        const option_9 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(9)),
          voteOptions_2.option_2.add(UInt32.from(1)),
          voteOptions_2.option_2
        );

        const option_10 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(10)),
          voteOptions_2.option_3.add(UInt32.from(1)),
          voteOptions_2.option_3
        );

        const option_11 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(11)),
          voteOptions_2.option_4.add(UInt32.from(1)),
          voteOptions_2.option_4
        );

        const option_12 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(12)),
          voteOptions_2.option_5.add(UInt32.from(1)),
          voteOptions_2.option_5
        );

        const option_13 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(13)),
          voteOptions_2.option_6.add(UInt32.from(1)),
          voteOptions_2.option_6
        );

        const option_14 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(14)),
          voteOptions_2.option_7.add(UInt32.from(1)),
          voteOptions_2.option_7
        );

        const voteOptions_2_new = new VoteOptions({
          option_1: option_8,
          option_2: option_9,
          option_3: option_10,
          option_4: option_11,
          option_5: option_12,
          option_6: option_13,
          option_7: option_14,
        }).compress();

        return {
          totalAggregatedCount:
            previousProof.publicOutput.totalAggregatedCount.add(1),
          rangeLowerBound: nullifier,
          rangeUpperBound: previousUpperBound,
          voteOptions_1: voteOptions_1_new,
          voteOptions_2: voteOptions_2_new,
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

        const voteOptions_1 = VoteOptions.decompress(
          previousProof.publicOutput.voteOptions_1
        );
        const voteOptions_2 = VoteOptions.decompress(
          previousProof.publicOutput.voteOptions_2
        );

        const option_1 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(1)),
          voteOptions_1.option_1.add(UInt32.from(1)),
          voteOptions_1.option_1
        );

        const option_2 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(2)),
          voteOptions_1.option_2.add(UInt32.from(1)),
          voteOptions_1.option_2
        );

        const option_3 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(3)),
          voteOptions_1.option_3.add(UInt32.from(1)),
          voteOptions_1.option_3
        );

        const option_4 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(4)),
          voteOptions_1.option_4.add(UInt32.from(1)),
          voteOptions_1.option_4
        );

        const option_5 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(5)),
          voteOptions_1.option_5.add(UInt32.from(1)),
          voteOptions_1.option_5
        );

        const option_6 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(6)),
          voteOptions_1.option_6.add(UInt32.from(1)),
          voteOptions_1.option_6
        );

        const option_7 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(7)),
          voteOptions_1.option_7.add(UInt32.from(1)),
          voteOptions_1.option_7
        );

        const voteOptions_1_new = new VoteOptions({
          option_1,
          option_2,
          option_3,
          option_4,
          option_5,
          option_6,
          option_7,
        }).compress();

        const option_8 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(8)),
          voteOptions_2.option_1.add(UInt32.from(1)),
          voteOptions_2.option_1
        );

        const option_9 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(9)),
          voteOptions_2.option_2.add(UInt32.from(1)),
          voteOptions_2.option_2
        );

        const option_10 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(10)),
          voteOptions_2.option_3.add(UInt32.from(1)),
          voteOptions_2.option_3
        );

        const option_11 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(11)),
          voteOptions_2.option_4.add(UInt32.from(1)),
          voteOptions_2.option_4
        );

        const option_12 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(12)),
          voteOptions_2.option_5.add(UInt32.from(1)),
          voteOptions_2.option_5
        );

        const option_13 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(13)),
          voteOptions_2.option_6.add(UInt32.from(1)),
          voteOptions_2.option_6
        );

        const option_14 = Provable.if(
          vote.publicOutput.vote.equals(Field.from(14)),
          voteOptions_2.option_7.add(UInt32.from(1)),
          voteOptions_2.option_7
        );

        const voteOptions_2_new = new VoteOptions({
          option_1: option_8,
          option_2: option_9,
          option_3: option_10,
          option_4: option_11,
          option_5: option_12,
          option_6: option_13,
          option_7: option_14,
        }).compress();

        return {
          totalAggregatedCount:
            previousProof.publicOutput.totalAggregatedCount.add(1),
          rangeLowerBound: previousLowerBound,
          rangeUpperBound: nullifier,
          voteOptions_1: voteOptions_1_new,
          voteOptions_2: voteOptions_2_new,
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

        const voteOptions_1 = leftProof.publicOutput.voteOptions_1.add(
          rightProof.publicOutput.voteOptions_1
        );
        const voteOptions_2 = leftProof.publicOutput.voteOptions_2.add(
          rightProof.publicOutput.voteOptions_2
        );

        return {
          totalAggregatedCount: leftProof.publicOutput.totalAggregatedCount.add(
            rightProof.publicOutput.totalAggregatedCount
          ),
          rangeLowerBound: leftLowerBound,
          rangeUpperBound: rightUpperBound,
          voteOptions_1: voteOptions_1,
          voteOptions_2: voteOptions_2,
        };
      },
    },
  },
});

export class AggregateProof extends ZkProgram.Proof(RangeAggregationProgram) {}

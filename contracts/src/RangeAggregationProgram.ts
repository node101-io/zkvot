import {
  Field,
  Provable,
  PublicKey,
  SelfProof,
  Struct,
  UInt32,
  ZkProgram,
} from 'o1js';

import { VoteProof } from './VoteProgram.js';

export function UInt32ToFieldBigEndian(arr: UInt32[]): Field {
  let acc = Field.from(0);
  let shift = Field.from(1);
  for (let i = 6; i >= 0; i--) {
    const byte = arr[i];
    byte.value.assertLessThanOrEqual(4294967295);
    acc = acc.add(byte.value.mul(shift));
    shift = shift.mul(4294967296);
  }
  return acc;
}

export function fieldToUInt32BigEndian(options: Field): UInt32[] {
  let bytes = Provable.witness(Provable.Array(UInt32, 7), () => {
    let w = options.toBigInt();
    return Array.from({ length: 7 }, (_, k) => {
      return UInt32.from((w >> BigInt(32 * (6 - k))) & 0xffffffffn);
    });
  });

  UInt32ToFieldBigEndian(bytes).assertEquals(options);

  return bytes;
}

export class RangeAggregationPublicInputs extends Struct({
  votersRoot: Field,
  electionId: PublicKey,
}) {}

export class RangeAggregationPublicOutputs extends Struct({
  totalAggregatedCount: Field,
  rangeLowerBound: Field,
  rangeUpperBound: Field,
  voteOptions_1: Field,
  voteOptions_2: Field,
  voteOptions_3: Field,
  voteOptions_4: Field,
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
          voteOptions_3: Field.from(0),
          voteOptions_4: Field.from(0),
        };
      },
    },
    base_one: {
      privateInputs: [VoteProof],
      async method(publicInput: RangeAggregationPublicInputs, vote: VoteProof) {
        vote.verify();

        vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
        vote.publicInput.electionId.assertEquals(publicInput.electionId);

        const nullifier = vote.publicOutput.nullifier;

        let batchOptionsArray: Field[] = new Array(6).fill(Field.from(0));
        for (let i = 0; i <= 5; i++) {
          let optionsArray: UInt32[] = new Array(7).fill(UInt32.from(0));
          for (let j = 1; j <= 7; j++) {
            optionsArray[j - 1] = Provable.if(
              vote.publicOutput.vote.equals(Field.from(j + 7 * i)),
              UInt32.from(1),
              UInt32.from(0)
            );
          }
          batchOptionsArray[i] = UInt32ToFieldBigEndian(optionsArray);
        }

        return {
          totalAggregatedCount: Field.from(1),
          rangeLowerBound: nullifier,
          rangeUpperBound: nullifier,
          voteOptions_1: batchOptionsArray[0],
          voteOptions_2: batchOptionsArray[1],
          voteOptions_3: batchOptionsArray[2],
          voteOptions_4: batchOptionsArray[3],
          voteOptions_5: batchOptionsArray[4],
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
        lowerVote.publicInput.electionId.assertEquals(publicInput.electionId);
        upperVote.publicInput.electionId.assertEquals(publicInput.electionId);

        const lowerNullifier = lowerVote.publicOutput.nullifier;
        const upperNullifier = upperVote.publicOutput.nullifier;

        lowerNullifier.assertLessThan(upperNullifier);

        let batchOptionsArray: Field[] = new Array(4).fill(Field.from(0));
        for (let i = 0; i <= 3; i++) {
          let optionsArray: UInt32[] = new Array(7).fill(UInt32.from(0));
          for (let j = 1; j <= 7; j++) {
            const lower = Provable.if(
              lowerVote.publicOutput.vote.equals(Field.from(j + 7 * i)),
              UInt32.from(1),
              UInt32.from(0)
            );
            const upper = Provable.if(
              upperVote.publicOutput.vote.equals(Field.from(j + 7 * i)),
              UInt32.from(1),
              UInt32.from(0)
            );
            optionsArray[j - 1] = lower.add(upper);
          }
          batchOptionsArray[i] = UInt32ToFieldBigEndian(optionsArray);
        }

        return {
          totalAggregatedCount: Field.from(2),
          rangeLowerBound: lowerNullifier,
          rangeUpperBound: upperNullifier,
          voteOptions_1: batchOptionsArray[0],
          voteOptions_2: batchOptionsArray[1],
          voteOptions_3: batchOptionsArray[2],
          voteOptions_4: batchOptionsArray[3],
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
        previousProof.publicInput.electionId.assertEquals(
          publicInput.electionId
        );
        previousProof.publicInput.votersRoot.assertEquals(
          publicInput.votersRoot
        );

        vote.verify();

        vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
        vote.publicInput.electionId.assertEquals(publicInput.electionId);

        const previousLowerBound = previousProof.publicOutput.rangeLowerBound;
        const previousUpperBound = previousProof.publicOutput.rangeUpperBound;

        const nullifier = vote.publicOutput.nullifier;

        previousLowerBound.assertGreaterThan(nullifier);

        let batchOptionsArray: Field[] = new Array(4).fill(Field.from(0));
        for (let i = 0; i <= 3; i++) {
          let optionsArray: UInt32[] = new Array(7).fill(UInt32.from(0));
          for (let j = 1; j <= 7; j++) {
            optionsArray[j - 1] = Provable.if(
              vote.publicOutput.vote.equals(Field.from(j + 7 * i)),
              UInt32.from(1),
              UInt32.from(0)
            );
          }
          batchOptionsArray[i] = UInt32ToFieldBigEndian(optionsArray);
        }
        return {
          totalAggregatedCount:
            previousProof.publicOutput.totalAggregatedCount.add(1),
          rangeLowerBound: nullifier,
          rangeUpperBound: previousUpperBound,
          voteOptions_1: batchOptionsArray[0].add(
            previousProof.publicOutput.voteOptions_1
          ),
          voteOptions_2: batchOptionsArray[1].add(
            previousProof.publicOutput.voteOptions_2
          ),
          voteOptions_3: batchOptionsArray[2].add(
            previousProof.publicOutput.voteOptions_3
          ),
          voteOptions_4: batchOptionsArray[3].add(
            previousProof.publicOutput.voteOptions_4
          ),
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
        previousProof.publicInput.electionId.assertEquals(
          publicInput.electionId
        );
        previousProof.publicInput.votersRoot.assertEquals(
          publicInput.votersRoot
        );
        vote.verify();

        vote.publicInput.votersRoot.assertEquals(publicInput.votersRoot);
        vote.publicInput.electionId.assertEquals(publicInput.electionId);

        const previousLowerBound = previousProof.publicOutput.rangeLowerBound;
        const previousUpperBound = previousProof.publicOutput.rangeUpperBound;

        const nullifier = vote.publicOutput.nullifier;

        previousUpperBound.assertLessThan(nullifier);

        let batchOptionsArray: Field[] = new Array(4).fill(Field.from(0));
        for (let i = 0; i <= 3; i++) {
          let optionsArray: UInt32[] = new Array(7).fill(UInt32.from(0));
          for (let j = 1; j <= 7; j++) {
            optionsArray[j - 1] = Provable.if(
              vote.publicOutput.vote.equals(Field.from(j + 7 * i)),
              UInt32.from(1),
              UInt32.from(0)
            );
          }
          batchOptionsArray[i] = UInt32ToFieldBigEndian(optionsArray);
        }

        return {
          totalAggregatedCount:
            previousProof.publicOutput.totalAggregatedCount.add(1),
          rangeLowerBound: previousLowerBound,
          rangeUpperBound: nullifier,
          voteOptions_1: batchOptionsArray[0].add(
            previousProof.publicOutput.voteOptions_1
          ),
          voteOptions_2: batchOptionsArray[1].add(
            previousProof.publicOutput.voteOptions_2
          ),
          voteOptions_3: batchOptionsArray[2].add(
            previousProof.publicOutput.voteOptions_3
          ),
          voteOptions_4: batchOptionsArray[3].add(
            previousProof.publicOutput.voteOptions_4
          ),
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
        leftProof.publicInput.electionId.assertEquals(publicInput.electionId);
        rightProof.publicInput.electionId.assertEquals(publicInput.electionId);

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

        const voteOptions_3 = leftProof.publicOutput.voteOptions_3.add(
          rightProof.publicOutput.voteOptions_3
        );

        const voteOptions_4 = leftProof.publicOutput.voteOptions_4.add(
          rightProof.publicOutput.voteOptions_4
        );

        return {
          totalAggregatedCount: leftProof.publicOutput.totalAggregatedCount.add(
            rightProof.publicOutput.totalAggregatedCount
          ),
          rangeLowerBound: leftLowerBound,
          rangeUpperBound: rightUpperBound,
          voteOptions_1: voteOptions_1,
          voteOptions_2: voteOptions_2,
          voteOptions_3: voteOptions_3,
          voteOptions_4: voteOptions_4,
        };
      },
    },
  },
});

export class AggregateProof extends ZkProgram.Proof(RangeAggregationProgram) {}

import {
  Field,
  Provable,
  PublicKey,
  SelfProof,
  Struct,
  UInt32,
  ZkProgram,
} from 'o1js';

import Vote from './Vote.js';

namespace AggregationNamespace {
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

  export class PublicInputs extends Struct({
    votersRoot: Field,
    electionPubKey: PublicKey,
  }) {}

  export class PublicOutputs extends Struct({
    totalAggregatedCount: Field,
    rangeLowerBound: Field,
    rangeUpperBound: Field,
    voteOptions_1: Field,
    voteOptions_2: Field,
    voteOptions_3: Field,
    voteOptions_4: Field,
  }) {}

  export const Program = ZkProgram({
    name: 'RangeAggregationProgram',
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
              voteOptions_1: Field.from(0),
              voteOptions_2: Field.from(0),
              voteOptions_3: Field.from(0),
              voteOptions_4: Field.from(0),
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
            publicOutput: {
              totalAggregatedCount: Field.from(1),
              rangeLowerBound: nullifier,
              rangeUpperBound: nullifier,
              voteOptions_1: batchOptionsArray[0],
              voteOptions_2: batchOptionsArray[1],
              voteOptions_3: batchOptionsArray[2],
              voteOptions_4: batchOptionsArray[3],
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
            publicOutput: {
              totalAggregatedCount: Field.from(2),
              rangeLowerBound: lowerNullifier,
              rangeUpperBound: upperNullifier,
              voteOptions_1: batchOptionsArray[0],
              voteOptions_2: batchOptionsArray[1],
              voteOptions_3: batchOptionsArray[2],
              voteOptions_4: batchOptionsArray[3],
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
            publicOutput: {
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
            publicOutput: {
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
            publicOutput: {
              totalAggregatedCount:
                leftProof.publicOutput.totalAggregatedCount.add(
                  rightProof.publicOutput.totalAggregatedCount
                ),
              rangeLowerBound: leftLowerBound,
              rangeUpperBound: rightUpperBound,
              voteOptions_1: voteOptions_1,
              voteOptions_2: voteOptions_2,
              voteOptions_3: voteOptions_3,
              voteOptions_4: voteOptions_4,
            },
          };
        },
      },
    },
  });

  export class Proof extends ZkProgram.Proof(Program) {}
}

export default AggregationNamespace;

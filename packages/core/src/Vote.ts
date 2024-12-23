import {
  Field,
  Poseidon,
  PublicKey,
  Struct,
  ZkProgram,
  Nullifier,
  Provable,
  UInt32,
  VerificationKey,
} from 'o1js';

import MerkleTree from './MerkleTree.js';
import { verificationKey as voteVK } from './verification-keys/VoteVK.js';

namespace VoteNamespace {
  /**
   * Converts a UInt32 array to a Field in big endian order
   * @param arr UInt32 array
   * @returns Field
   */
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

  /**
   * Converts a Field to a UInt32 array in big endian order
   * @param options Field
   * @returns UInt32 array
   */
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

  /**
   * Vote options struct for the election
   * Each field represents the number of votes for a 7-option vote
   */
  export class VoteOptions extends Struct({
    voteOptions_1: Field,
    voteOptions_2: Field,
    voteOptions_3: Field,
  }) {
    static empty(): VoteOptions {
      return new VoteOptions({
        voteOptions_1: Field.from(0),
        voteOptions_2: Field.from(0),
        voteOptions_3: Field.from(0),
      });
    }

    /**
     * Adds a vote to current vote options
     * @param vote Vote Proof
     * @returns Updated VoteOptions
     */
    addVote(vote: Proof) {
      let batchOptionsArray: Field[] = new Array(4).fill(Field.from(0));
      for (let i = 0; i <= 2; i++) {
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
      return new VoteOptions({
        voteOptions_1: this.voteOptions_1.add(batchOptionsArray[0]),
        voteOptions_2: this.voteOptions_2.add(batchOptionsArray[1]),
        voteOptions_3: this.voteOptions_3.add(batchOptionsArray[2]),
      });
    }

    /**
     * Converts the vote options to readible array of numbers
     * @returns Array of numbers
     */
    toResults(): number[] {
      // TODO: Convert to unprovable at start, unoptimized like this
      let results: number[] = [];

      let voteArr = fieldToUInt32BigEndian(this.voteOptions_1);
      for (let i = 0; i < 7; i++) {
        results.push(Number(voteArr[i].toBigint()));
      }

      voteArr = fieldToUInt32BigEndian(this.voteOptions_2);
      for (let i = 0; i < 7; i++) {
        results.push(Number(voteArr[i].toBigint()));
      }

      voteArr = fieldToUInt32BigEndian(this.voteOptions_3);
      for (let i = 0; i < 7; i++) {
        results.push(Number(voteArr[i].toBigint()));
      }

      return results;
    }
  }

  export class PublicInputs extends Struct({
    electionPubKey: PublicKey,
    vote: Field,
    votersRoot: Field,
  }) {}

  export class PrivateInputs extends Struct({
    voterKey: PublicKey,
    nullifier: Nullifier,
    votersMerkleWitness: MerkleTree.Witness,
  }) {}

  export class PublicOutputs extends Struct({
    vote: Field,
    nullifier: Field,
  }) {}

  export const Program = ZkProgram({
    name: 'Vote',
    publicInput: PublicInputs,
    publicOutput: PublicOutputs,

    methods: {
      vote: {
        privateInputs: [PrivateInputs],
        async method(publicInput: PublicInputs, privateInput: PrivateInputs) {
          let voterPublicKey = privateInput.voterKey;
          privateInput.votersMerkleWitness
            .calculateRoot(Poseidon.hash(voterPublicKey.toFields()))
            .assertEquals(publicInput.votersRoot);

          let nullifier = privateInput.nullifier;

          nullifier.verify([
            Poseidon.hash(publicInput.electionPubKey.toFields()),
          ]);

          nullifier.getPublicKey().assertEquals(voterPublicKey);

          return {
            publicOutput: {
              vote: publicInput.vote,
              nullifier: nullifier.key(),
            },
          };
        },
      },
    },
  });

  export class Proof extends ZkProgram.Proof(Program) {}

  export const verificationKey: VerificationKey = JSON.parse(voteVK);
};

export default VoteNamespace;

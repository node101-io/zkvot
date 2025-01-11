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
  export const VOTE_OPTION_COMPRESSED = 7;
  export const VOTE_OPTIONS_LEN = 2;
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
      return Array.from({ length: VOTE_OPTION_COMPRESSED }, (_, k) => {
        return UInt32.from((w >> BigInt(32 * (6 - k))) & 0xffffffffn);
      });
    });

    UInt32ToFieldBigEndian(bytes).assertEquals(options);

    return bytes;
  }

  /**
   * Vote options struct for the election
   * Each field represents the number of votes for a VOTE_OPTION_COMPRESSED-option vote
   */
  export class VoteOptions extends Struct({
    options: Provable.Array(Field, VOTE_OPTIONS_LEN),
  }) {
    static empty(): VoteOptions {
      const options = Array<Field>(10).fill(Field.from(0));
      return new VoteOptions({ options });
    }

    /**
     * Adds a vote to current vote options
     * @param vote Vote Proof
     * @returns Updated VoteOptions
     */
    addVote(vote: Proof) {
      for (let i = 0; i <= VOTE_OPTIONS_LEN - 1; i++) {
        let optionsArray: UInt32[] = new Array(VOTE_OPTION_COMPRESSED).fill(
          UInt32.from(0)
        );
        for (let j = 1; j <= VOTE_OPTION_COMPRESSED; j++) {
          optionsArray[j - 1] = Provable.if(
            vote.publicOutput.vote.equals(
              Field.from(j + VOTE_OPTION_COMPRESSED * i)
            ),
            UInt32.from(1),
            UInt32.from(0)
          );
        }
        const mask = UInt32ToFieldBigEndian(optionsArray);

        this.options[i] = this.options[i].add(mask);
      }

      return this;
    }

    /**
     * Merges two vote options
     * @param voteOptions VoteOptions to merge
     * @returns Merged VoteOptions
     */
    merge(voteOptions: VoteOptions): VoteOptions {
      for (let i = 0; i <= VOTE_OPTIONS_LEN - 1; i++) {
        this.options[i] = this.options[i].add(voteOptions.options[i]);
      }

      return this;
    }

    /**
     * Converts the vote options to readible array of numbers
     * @returns Array of numbers
     */
    toResults(): number[] {
      // TODO: Convert to unprovable at start, unoptimized like this
      let results: number[] = [];

      for (let i = 0; i < VOTE_OPTIONS_LEN; i++) {
        let voteArr = fieldToUInt32BigEndian(this.options[i]);
        for (let j = 0; j < VOTE_OPTION_COMPRESSED; j++) {
          results.push(Number(voteArr[j].toBigint()));
        }
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
}

export default VoteNamespace;

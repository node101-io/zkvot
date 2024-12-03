import {
  Bytes,
  Crypto,
  createForeignCurveV2,
  Field,
  Poseidon,
  Provable,
  PublicKey,
  Signature,
  Struct,
  UInt8,
  ZkProgram,
  createEcdsaV2,
  Keccak,
} from "o1js";

import MerkleTree from "./MerkleTree.js";

class Bytes64 extends Bytes(64) {}

function bytesToFieldBigEndian(wordBytes: UInt8[], toManyBytes: number): Field {
  let acc = Field.from(0);
  let shift = Field.from(1);
  for (let i = toManyBytes - 1; i >= 0; i--) {
    const byte = wordBytes[i];
    byte.value.assertLessThanOrEqual(255);
    acc = acc.add(byte.value.mul(shift));
    shift = shift.mul(256);
  }
  return acc;
}

function fieldToBytesBigEndian(word: Field, toManyBytes: number): UInt8[] {
  let bytes = Provable.witness(Provable.Array(UInt8, toManyBytes), () => {
    let w = word.toBigInt();
    return Array.from({ length: toManyBytes }, (_, k) => {
      return UInt8.from((w >> BigInt(8 * (toManyBytes - 1 - k))) & 0xffn);
    });
  });

  bytesToFieldBigEndian(bytes, toManyBytes).assertEquals(word);

  return bytes;
}

namespace VoteNamespace {
  export class PublicInputs extends Struct({
    electionId: PublicKey,
    vote: Field,
    votersRoot: Field,
  }) {}

  export class PrivateInputs extends Struct({
    voterKey: PublicKey,
    signedElectionId: Signature,
    votersMerkleWitness: MerkleTree.Witness,
  }) {}

  export class PublicOutputs extends Struct({
    vote: Field,
    nullifier: Field,
  }) {}

  export const Program = ZkProgram({
    name: "Vote",
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

          privateInput.signedElectionId.verify(
            voterPublicKey,
            publicInput.electionId.toFields()
          );

          let nullifier = Poseidon.hash(
            privateInput.signedElectionId.toFields()
          );

          return {
            vote: publicInput.vote,
            nullifier: nullifier,
          };
        },
      },
    },
  });

  export class Proof extends ZkProgram.Proof(Program) {}
}

export default VoteNamespace;

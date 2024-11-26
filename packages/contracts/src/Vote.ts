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
} from 'o1js';

import MerkleTree from './MerkleTree.js';

class Secp256k1 extends createForeignCurveV2(Crypto.CurveParams.Secp256k1) {}
class Ecdsa extends createEcdsaV2(Secp256k1) {}
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
};

function fieldToBytesBigEndian(word: Field, toManyBytes: number): UInt8[] {
  let bytes = Provable.witness(Provable.Array(UInt8, toManyBytes), () => {
    let w = word.toBigInt();
    return Array.from({ length: toManyBytes }, (_, k) => {
      return UInt8.from((w >> BigInt(8 * (toManyBytes - 1 - k))) & 0xffn);
    });
  });

  bytesToFieldBigEndian(bytes, toManyBytes).assertEquals(word);

  return bytes;
};

namespace VoteNamespace {
  export class PublicInputs extends Struct({
    electionId: PublicKey,
    vote: Field,
    votersRoot: Field,
  }) {};

  export class PrivateInputs extends Struct({
    voterKey: PublicKey,
    signedElectionId: Signature,
    votersMerkleWitness: MerkleTree.Witness,
  }) {};

  export class PublicOutputs extends Struct({
    vote: Field,
    nullifier: Field,
  }) {};

  export class VoteWithSecp256k1PrivateInputs extends Struct({
    voterAddress: Field,
    voterPubKey: Secp256k1,
    signedElectionId: Ecdsa,
    votersMerkleWitness: MerkleTree.Witness,
  }) {}

  export const Program = ZkProgram({
    name: 'Vote',
    publicInput: PublicInputs,
    publicOutput: PublicOutputs,
  
    methods: {
      vote: {
        privateInputs: [PrivateInputs],
        async method(
          publicInput: PublicInputs,
          privateInput: PrivateInputs
        ) {
          let voterPublicKey = privateInput.voterKey;
          privateInput.votersMerkleWitness
            .calculateRoot(Poseidon.hash(voterPublicKey.toFields()))
            .assertEquals(publicInput.votersRoot);
  
          privateInput.signedElectionId.verify(
            voterPublicKey,
            publicInput.electionId.toFields()
          );
  
          let nullifier = Poseidon.hash(privateInput.signedElectionId.toFields());
  
          return {
            vote: publicInput.vote,
            nullifier: nullifier,
          };
        },
      },
      voteWithSecp256k1: {
        privateInputs: [VoteWithSecp256k1PrivateInputs],
        async method(
          publicInput: PublicInputs,
          privateInput: VoteWithSecp256k1PrivateInputs
        ) {
          const voterAddress = privateInput.voterAddress;
          const voterPublicKey = privateInput.voterPubKey;
  
          // Ensure voterAddress is in the list
          privateInput.votersMerkleWitness
            .calculateRoot(voterAddress)
            .assertEquals(publicInput.votersRoot);
  
          // Ensure Address is derived from the public key
          const voterPubKeyUI8Arr = [
            ...fieldToBytesBigEndian(voterPublicKey.x.value[2], 10),
            ...fieldToBytesBigEndian(voterPublicKey.x.value[1], 11),
            ...fieldToBytesBigEndian(voterPublicKey.x.value[0], 11),
            ...fieldToBytesBigEndian(voterPublicKey.y.value[2], 10),
            ...fieldToBytesBigEndian(voterPublicKey.y.value[1], 11),
            ...fieldToBytesBigEndian(voterPublicKey.y.value[0], 11),
          ];
  
          const calculatedAddressBytes = Keccak.ethereum(voterPubKeyUI8Arr).bytes;
  
          const calculatedAddress = calculatedAddressBytes.slice(12, 32);
  
          bytesToFieldBigEndian(calculatedAddress, 20).assertEquals(voterAddress);
  
          // Verify the signature with the public key
          const signedElectionId = privateInput.signedElectionId;
  
          const electionIdFirstField = publicInput.electionId.toFields()[0];
          const electionIdSecondField = publicInput.electionId.toFields()[1];
  
          let electionIdFirstFieldBytes = fieldToBytesBigEndian(
            electionIdFirstField,
            32
          );
          let electionIdSecondFieldBytes = fieldToBytesBigEndian(
            electionIdSecondField,
            32
          );
  
          const signedElectionIdMessage = Bytes64.from([
            ...electionIdFirstFieldBytes,
            ...electionIdSecondFieldBytes,
          ]);
  
          signedElectionId
            .verifyEthers(signedElectionIdMessage, voterPublicKey)
            .assertTrue();
  
          return {
            vote: publicInput.vote,
            nullifier: Poseidon.hash([
              ...privateInput.signedElectionId.r.value,
              ...privateInput.signedElectionId.s.value,
            ]),
          };
        },
      },
    },
  });

  export class Proof extends ZkProgram.Proof(Program) {}
};

export default VoteNamespace;
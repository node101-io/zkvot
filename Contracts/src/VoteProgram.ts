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
} from 'o1js';
import { MerkleWitnessClass } from './utils.js';

class Secp256k1 extends createForeignCurveV2(Crypto.CurveParams.Secp256k1) {}
class Ecdsa extends createEcdsaV2(Secp256k1) {}
// class Bytes96 extends Bytes(96) {}
class Bytes64 extends Bytes(64) {}

function bytesToFieldBigEndian(wordBytes: UInt8[]): Field {
  let acc = Field.from(0);
  let shift = Field.from(1);
  for (let i = 31; i >= 0; i--) {
    const byte = wordBytes[i];
    byte.value.assertLessThanOrEqual(255);
    acc = acc.add(byte.value.mul(shift));
    shift = shift.mul(256);
  }
  return acc;
}

function fieldToBytesBigEndian(word: Field): UInt8[] {
  let bytes = Provable.witness(Provable.Array(UInt8, 32), () => {
    let w = word.toBigInt();
    return Array.from({ length: 32 }, (_, k) => {
      return UInt8.from((w >> BigInt(8 * (31 - k))) & 0xffn);
    });
  });

  bytesToFieldBigEndian(bytes).assertEquals(word);

  return bytes;
}

export class VotePublicInputs extends Struct({
  electionId: PublicKey,
  vote: Field,
  votersRoot: Field,
}) {}

export class VotePublicOutputs extends Struct({
  vote: Field,
  nullifier: Field,
}) {}

export class VotePrivateInputs extends Struct({
  voterKey: PublicKey,
  signedVoteId: Signature,
  // signedVote: Signature,
  votersMerkleWitness: MerkleWitnessClass,
}) {}

export class VoteWithSecp256k1PrivateInputs extends Struct({
  voterKey: Secp256k1,
  signedVoteId: Ecdsa,
  // signedVote: Ecdsa,
  votersMerkleWitness: MerkleWitnessClass,
}) {}

export const Vote = ZkProgram({
  name: 'Vote',
  publicInput: VotePublicInputs,
  publicOutput: VotePublicOutputs,

  methods: {
    vote: {
      privateInputs: [VotePrivateInputs],
      async method(
        publicInput: VotePublicInputs,
        privateInput: VotePrivateInputs
      ) {
        let voterPublicKey = privateInput.voterKey;
        privateInput.votersMerkleWitness
          .calculateRoot(Poseidon.hash(voterPublicKey.toFields()))
          .assertEquals(publicInput.votersRoot);

        privateInput.signedVoteId.verify(
          voterPublicKey,
          publicInput.electionId.toFields()
        );

        // privateInput.signedVote.verify(voterPublicKey, [
        //   ...publicInput.electionId.toFields(),
        //   publicInput.vote,
        // ]);

        let nullifier = Poseidon.hash(privateInput.signedVoteId.toFields());

        return {
          vote: publicInput.vote,
          nullifier: nullifier,
        };
      },
    },
    voteWithSecp256k1: {
      privateInputs: [VoteWithSecp256k1PrivateInputs],
      async method(
        publicInput: VotePublicInputs,
        privateInput: VoteWithSecp256k1PrivateInputs
      ) {
        const voterPublicKey = privateInput.voterKey;
        const publicKeyFields = [
          ...voterPublicKey.x.value,
          ...voterPublicKey.y.value,
        ];
        privateInput.votersMerkleWitness
          .calculateRoot(Poseidon.hash(publicKeyFields))
          .assertEquals(publicInput.votersRoot);

        // const signedVote = privateInput.signedVote;
        const signedVoteId = privateInput.signedVoteId;

        const electionId_first_field = publicInput.electionId.toFields()[0];
        const electionId_second_field = publicInput.electionId.toFields()[1];
        // const vote = publicInput.vote;

        let voteIdFirstFieldBytes = fieldToBytesBigEndian(
          electionId_first_field
        );
        let voteIdSecondFieldBytes = fieldToBytesBigEndian(
          electionId_second_field
        );
        // let voteBytes = fieldToBytesBigEndian(vote);

        const signedVoteIdMessage = Bytes64.from([
          ...voteIdFirstFieldBytes,
          ...voteIdSecondFieldBytes,
        ]);
        // const signedVoteMessage = Bytes96.from([
        //   ...voteIdFirstFieldBytes,
        //   ...voteIdSecondFieldBytes,
        //   ...voteBytes,
        // ]);

        signedVoteId
          .verifyEthers(signedVoteIdMessage, voterPublicKey)
          .assertTrue();

        // signedVote.verifyEthers(signedVoteMessage, voterPublicKey).assertTrue();

        return {
          vote: publicInput.vote,
          nullifier: Poseidon.hash([
            ...privateInput.signedVoteId.r.value,
            ...privateInput.signedVoteId.s.value,
          ]),
        };
      },
    },
  },
});

export class VoteProof extends ZkProgram.Proof(Vote) {}

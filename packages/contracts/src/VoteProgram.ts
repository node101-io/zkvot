import { Field, Poseidon, PublicKey, Struct, ZkProgram, Nullifier } from "o1js";
import { MerkleWitnessClass } from "./utils.js";

export class VotePublicInputs extends Struct({
  electionPubKey: PublicKey,
  vote: Field,
  votersRoot: Field,
}) {}

export class VotePublicOutputs extends Struct({
  vote: Field,
  nullifier: Field,
}) {}

export class VotePrivateInputs extends Struct({
  voterKey: PublicKey,
  nullifier: Nullifier,
  votersMerkleWitness: MerkleWitnessClass,
}) {}

export const Vote = ZkProgram({
  name: "Vote",
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

        let nullifier = privateInput.nullifier;

        nullifier.verify(publicInput.electionPubKey.toFields());

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

export class VoteProof extends ZkProgram.Proof(Vote) {}

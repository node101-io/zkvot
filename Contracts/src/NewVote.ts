import {
  Field,
  Poseidon,
  PrivateKey,
  PublicKey,
  Struct,
  ZkProgram,
} from 'o1js';
import { MerkleWitnessClass } from './utils.js';

// public inputlar outputta verilmezse degistirilebilir mi?
export class VotePublicInputs extends Struct({
  votingId: Field,
  vote: Field,
  votersRoot: Field,
}) {}

export class VotePublicOutputs extends Struct({
  vote: Field,
  identifierHash: Field,
}) {}

export class VotePrivateInputs extends Struct({
  privateKey: PrivateKey,
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
        let voterPublicKey = PublicKey.fromPrivateKey(privateInput.privateKey);
        privateInput.votersMerkleWitness
          .calculateRoot(Poseidon.hash(voterPublicKey.toFields()))
          .assertEquals(publicInput.votersRoot);

        let identifierHash = Poseidon.hash([
          Poseidon.hash(privateInput.privateKey.toFields()),
          publicInput.votingId,
        ]);

        return {
          vote: publicInput.vote,
          identifierHash: identifierHash,
        };
      },
    },
  },
});

export class VoteProof extends ZkProgram.Proof(Vote) {}

import {
  Field,
  Poseidon,
  PrivateKey,
  PublicKey,
  Signature,
  Struct,
  ZkProgram,
} from 'o1js';
import { MerkleWitnessClass } from './utils.js';

export class VotePublicInputs extends Struct({
  votingId: Field,
  vote: Field,
  votersRoot: Field,
}) {}

export class VotePublicOutputs extends Struct({
  vote: Field,
  nullifier: Field,
}) {}

export class VotePrivateInputs extends Struct({
  // privateKey: PrivateKey,
  voterKey: PublicKey,
  signedVoteId: Signature,
  signedVote: Signature,
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
        // let voterPublicKey = PublicKey.fromPrivateKey(privateInput.privateKey);
        let voterPublicKey = privateInput.voterKey;
        privateInput.votersMerkleWitness
          .calculateRoot(Poseidon.hash(voterPublicKey.toFields()))
          .assertEquals(publicInput.votersRoot);

        privateInput.signedVoteId.verify(voterPublicKey, [
          publicInput.votingId,
        ]);

        privateInput.signedVote.verify(voterPublicKey, [
          publicInput.votingId,
          publicInput.vote,
        ]);

        let nullifier = Poseidon.hash(privateInput.signedVoteId.toFields());

        return {
          vote: publicInput.vote,
          nullifier: nullifier,
        };
      },
    },
  },
});

export class VoteProof extends ZkProgram.Proof(Vote) {}

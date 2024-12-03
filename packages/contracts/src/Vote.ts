import { Field, Poseidon, PublicKey, Struct, ZkProgram, Nullifier } from 'o1js';
import MerkleTree from './MerkleTree.js';

namespace VoteNamespace {
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

  export class Proof extends ZkProgram.Proof(Program) {}
}

export default VoteNamespace;

import {
  Field,
  MerkleWitness,
  Poseidon,
  PrivateKey,
  PublicKey,
  Struct,
  ZkProgram,
} from 'o1js';

const MERKLE_DEPTH = 32;

export class MerkleWitnessClass extends MerkleWitness(MERKLE_DEPTH) {}

export class VoteProgramPublicInputs extends Struct({
  nullifierRoot: Field,
  votersRoot: Field,
}) {}

export class VoteProgramPublicOutputs extends Struct({
  nullifierRoot: Field,
  votersRoot: Field,
  vote: Field,
}) {}

export class VoteProgramPrivateInputs extends Struct({
  privateKey: PrivateKey,
  nullifierWitness: MerkleWitnessClass,
  votersWitness: MerkleWitnessClass,
}) {}

export const VoteProgram = ZkProgram({
  name: 'VoteProgram',

  publicInput: VoteProgramPublicInputs,
  publicOutput: VoteProgramPublicOutputs,

  methods: {
    castVote: {
      privateInputs: [VoteProgramPrivateInputs],
      async method(
        publicInput: VoteProgramPublicInputs,
        privateInput: VoteProgramPrivateInputs
      ) {
        // check if the voter is eligible
        let voterPublicKey = PublicKey.fromPrivateKey(privateInput.privateKey);
        privateInput.votersWitness
          .calculateRoot(Poseidon.hash(voterPublicKey.toFields()))
          .assertEquals(publicInput.votersRoot);

        // check if the nullifier is not spent

        return {
          nullifierRoot: Field.from(0),
          votersRoot: Field.from(0),
          vote: Field.from(0),
        };
      },
    },
  },
});

export class VoteProgramProof extends ZkProgram.Proof(VoteProgram) {}

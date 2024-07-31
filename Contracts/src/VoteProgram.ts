import {
  Field,
  MerkleWitness,
  Poseidon,
  PrivateKey,
  PublicKey,
  Struct,
  ZkProgram,
} from 'o1js';
import { MerkleWitnessClass } from './utils.js';

export class VoteProgramPublicInputs extends Struct({}) {}

export class VoteProgramPublicOutputs extends Struct({
  vote: Field,
}) {}

export class VoteProgramPrivateInputs extends Struct({}) {}

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

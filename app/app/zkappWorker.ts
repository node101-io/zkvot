import {
  MerkleTree,
  Poseidon,
  Field,
  PublicKey,
  Signature
} from "o1js";
import * as Comlink from "comlink";
import { Vote, VotePrivateInputs, VotePublicInputs, MerkleWitnessClass } from 'contracts';
import { encodeDataToBase64String } from '../utils/encodeDataToBase64String';

const state = {
  Program: null as null | typeof Vote,
};

const createMerkleTreeFromLeaves = (leaves: string[]) => {
  let votersTree = new MerkleTree(20);

  for (let i = 0; i < leaves.length; i++) {
    const leaf = Poseidon.hash(PublicKey.fromJSON(leaves[i]).toFields());

    votersTree.setLeaf(BigInt(i), leaf);
  }

  return votersTree;
};

export const api = {
  async loadProgram() {
    const { Vote } = await import("../../contracts/build/src/VoteProgram.js");
    state.Program = Vote;
  },
  async compileProgram() {
    await state.Program?.compile();
  },
  async createVote(data: any) {
    console.log('data', data);

    const { electionId, signedElectionId, vote, votersArray, publicKey } = data;

    const votersTree = createMerkleTreeFromLeaves(votersArray);

    console.log('votersTree', votersTree);

    const witness = votersTree.getWitness(BigInt(votersArray.indexOf(publicKey)));

    console.log('witness', witness);

    const votePublicInputs = new VotePublicInputs({
      electionId: PublicKey.fromJSON(electionId),
      vote: Field.from(vote),
      votersRoot: votersTree.getRoot(),
    });

    console.log('votePublicInputs', votePublicInputs);

    const votePrivateInputs = new VotePrivateInputs({
      voterKey: PublicKey.fromJSON(publicKey),
      signedElectionId: Signature.fromJSON(signedElectionId),
      votersMerkleWitness: new MerkleWitnessClass(witness),
    });

    console.log('votePrivateInputs', votePrivateInputs);

    console.time('vote proof generation');

    const voteProof = await Vote.vote(votePublicInputs, votePrivateInputs);

    console.log('voteProof', voteProof);

    console.timeEnd('vote proof generation');

    encodeDataToBase64String(voteProof.toJSON(), (error, encodedVoteProof) => {
      console.log(error, encodedVoteProof);

      if (error)
        return console.error(error);

      return encodedVoteProof;
    });
  }
};

Comlink.expose(api);

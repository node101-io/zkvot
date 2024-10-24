import {
  MerkleTree,
  Poseidon,
  Signature,
  PublicKey,
} from "o1js";
import * as Comlink from "comlink";
import { Vote, VotePrivateInputs, VotePublicInputs, MerkleWitnessClass } from 'contracts';
import { encodeDataToBase64String } from '../utils/encodeDataToBase64String.js';

const createMerkleTreeFromLeaves = (leaves: string[]): MerkleTree => {
  let votersTree = new MerkleTree(20);

  for (let i = 0; i < leaves.length; i++) {
    const leaf = Poseidon.hash(PublicKey.fromJSON(leaves[i]).toFields());

    votersTree.setLeaf(BigInt(i), leaf);
  }

  return votersTree;
};
const state = {
  Program: null as null | typeof Vote,
};

export const api = {
  async loadProgram() {
    const { Vote } = await import("../../contracts/build/src/VoteProgram.js");
    state.Program = Vote;
  },
  async compileProgram() {
    await state.Program?.compile();
  },
  async createVote({ signature: string, candidate: number }): JSON {
    const publicInputs = new VotePublicInputs({
      electionId: PublicKey.fromHex("0x01"),
      vote: BigInt(candidate),
      votersRoot: BigInt(0),
    });

    Vote.proof.vote(privateInputs, publicInputs).then((proof) => {
      return proof.toJSON();
    });
  },
};

Comlink.expose(api);

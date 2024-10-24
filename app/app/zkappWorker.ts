import { MerkleTree, Poseidon, Field, PublicKey, Signature } from "o1js";
import * as Comlink from "comlink";
import {
  Vote,
  VotePrivateInputs,
  VotePublicInputs,
  MerkleWitnessClass,
} from "contracts";
import { encodeDataToBase64String } from "../utils/encodeDataToBase64String";

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
    if (!state.Program) {
      throw new Error("Program not loaded. Call loadProgram() first.");
    }
    await state.Program.compile({ proofsEnabled: true });
    if (!state.Program.proofsEnabled) {
      throw new Error("Proofs were not enabled during compilation.");
    }
    console.log("state.Program compiled with proofs enabled:", state.Program);
  },
  async createVote(data: any) {
    if (!state.Program) {
      throw new Error("Program not loaded. Call loadProgram() first.");
    }
    if (!state.Program.proofsEnabled) {
      throw new Error(
        "Program not compiled with proofs enabled. Call compileProgram() first."
      );
    }

    console.log("data", data);

    const { electionId, signedElectionId, vote, votersArray, publicKey } = data;

    const votersTree = createMerkleTreeFromLeaves(votersArray);
    console.log("votersTree", votersTree);

    const voterIndex = votersArray.indexOf(publicKey);
    if (voterIndex === -1) {
      throw new Error("Public key not found in voters array.");
    }

    const witness = votersTree.getWitness(BigInt(voterIndex));
    console.log("witness", witness);

    const votePublicInputs = new VotePublicInputs({
      electionId: PublicKey.fromJSON(electionId),
      vote: Field.from(vote),
      votersRoot: votersTree.getRoot(),
    });
    console.log("votePublicInputs", votePublicInputs);

    const votePrivateInputs = new VotePrivateInputs({
      voterKey: PublicKey.fromJSON(publicKey),
      signedElectionId: Signature.fromJSON(signedElectionId),
      votersMerkleWitness: new MerkleWitnessClass(witness),
    });
    console.log("votePrivateInputs", votePrivateInputs);

    console.time("vote proof generation");

    try {
      const voteProof = await state.Program.vote(
        votePublicInputs,
        votePrivateInputs
      );
      console.log("voteProof", voteProof);

      console.timeEnd("vote proof generation");

      encodeDataToBase64String(
        voteProof.toJSON(),
        (error, encodedVoteProof) => {
          if (error) {
            console.error("Error encoding vote proof:", error);
            return;
          }

          console.log("Encoded Vote Proof:", encodedVoteProof);
        }
      );
    } catch (error) {
      console.error("Error generating zk-proof:", error);
    }
  },
};

Comlink.expose(api);

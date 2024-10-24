import { Mina, PublicKey, fetchAccount } from "o1js";
import * as Comlink from "comlink";
import {
  Vote,
  VotePublicInputs,
  VotePublicOutputs,
  VotePrivateInputs,
} from "../../contracts/src/VoteProgram";

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
  // async createVote({ signature: string, candidate: number }): JSON {
  //   const publicInputs = new VotePublicInputs({
  //     electionId: PublicKey.fromHex("0x01"),
  //     vote: BigInt(candidate),
  //     votersRoot: BigInt(0),
  //   });

  //   Vote.proof.vote(privateInputs, publicInputs).then((proof) => {
  //     return proof.toJSON();
  //   });
  // },
};

Comlink.expose(api);

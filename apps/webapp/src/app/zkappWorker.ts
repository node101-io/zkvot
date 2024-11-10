import {
  MerkleTree,
  Poseidon,
  Field,
  PublicKey,
  Signature,
  PrivateKey,
  Mina,
} from "o1js";
import * as Comlink from "comlink";
import {
  ElectionData,
  ElectionContract,
  MerkleWitnessClass,
  Vote,
  VotePrivateInputs,
  VotePublicInputs,
} from "zkvot-contracts";
import { encodeDataToBase64String } from "../utils/encodeDataToBase64String.js";

const state = {
  Program: null as null | typeof Vote,
  ElectionContract: null as null | typeof ElectionContract,
  ElectionContractInstance: null as null | ElectionContract,
};

const createMerkleTreeFromLeaves = (leaves: string[]) => {
  let votersTree = new MerkleTree(20);

  leaves = leaves.sort((a, b) => {
    if (BigInt(a) < BigInt(b)) return -1;
    if (BigInt(a) > BigInt(b)) return 1;
    return 0;
  });

  for (let i = 0; i < leaves.length; i++) {
    const leaf = Poseidon.hash(PublicKey.fromJSON(leaves[i]).toFields());
    votersTree.setLeaf(BigInt(i), leaf);
  }
  return votersTree;
};

export const api = {
  async loadProgram() {
    const { Vote } = await import("zkvot-contracts");
    state.Program = Vote;
  },
  async compileProgram() {
    await state.Program?.compile({ proofsEnabled: true });
  },
  async loadAndCompileContracts(
    electionStartTimestamp: number,
    electionFinalizeTimestamp: number,
    votersRoot: bigint
  ) {
    if (!state.ElectionContract) {
      const { ElectionContract } = await import("zkvot-contracts");
      const { setElectionContractConstants } = await import("zkvot-contracts");
      setElectionContractConstants({
        electionStartTimestamp,
        electionFinalizeTimestamp,
        votersRoot,
      });
      state.ElectionContract = ElectionContract;
    }
    await state.ElectionContract.compile();
  },
  getElectionContractInstance(contractAddress: string) {
    if (!state.ElectionContract) {
      throw new Error(
        "ElectionContract not loaded. Call loadAndCompileContracts() first."
      );
    }
    if (!state.ElectionContractInstance) {
      state.ElectionContractInstance = new state.ElectionContract(
        PublicKey.fromBase58(contractAddress)
      );
    }
    return state.ElectionContractInstance;
  },
  async createVote(data: any): Promise<string> {
    if (!state.Program)
      throw new Error("Program not loaded. Call loadProgram() first.");

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

      const encodedVoteProof = await new Promise<string>((resolve, reject) => {
        encodeDataToBase64String(voteProof.toJSON(), (error, base64String) => {
          if (error) {
            console.error("Error encoding vote proof:", error);
            reject(error);
          } else {
            console.log("Encoded Vote Proof:", base64String);
            if (base64String !== undefined) {
              resolve(base64String);
            } else {
              reject(new Error("Encoded vote proof is undefined"));
            }
          }
        });
      });

      console.log("Returning encodedVoteProof:", encodedVoteProof);
      return encodedVoteProof;
    } catch (error) {
      console.error("Error generating zk-proof:", error);
      throw error;
    }
  },

  async deployElection(
    electionDeployer: string,
    electionStartTimestamp: number,
    electionFinalizeTimestamp: number,
    votersRoot: bigint,
    electionData: {
      first: bigint;
      last: bigint;
    },
    settlementReward: number
  ) {
    try {
      const electionContractPrivKey = PrivateKey.random();
      const electionContractPubKey = electionContractPrivKey.toPublicKey();

      await this.loadAndCompileContracts(
        electionStartTimestamp,
        electionFinalizeTimestamp,
        votersRoot
      );
      const electionContract = api.getElectionContractInstance(
        electionContractPubKey.toBase58()
      );

      const deployTx = await Mina.transaction(
        {
          sender: PublicKey.fromBase58(electionDeployer),
          fee: 1e8,
        },
        async () => {
          await electionContract.deploy();
          await electionContract.initialize(
            new ElectionData({
              first: Field.from(electionData.first),
              last: Field.from(electionData.last),
            })
          );
        }
      );
      await deployTx.prove();
      return deployTx.toJSON();
    } catch (error) {
      console.error("Error deploying election contract:", error);
    }
  },
};

Comlink.expose(api);

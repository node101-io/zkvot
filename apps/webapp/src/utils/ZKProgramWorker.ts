import { Field, Mina, PublicKey, PrivateKey, Nullifier } from 'o1js';
import * as Comlink from 'comlink';

import { Aggregation, Election, MerkleTree, Vote } from 'zkvot-core';

import encodeDataToBase64String from '@/utils/encodeDataToBase64String.js';

const state = {
  Program: null as null | typeof Vote.Program,
  ElectionContract: null as null | typeof Election.Contract,
  ElectionContractInstance: null as null | Election.Contract,
};

export const api = {
  setActiveInstanceToDevnet: async () => {
    const Network = Mina.Network({
      mina: 'https://api.minascan.io/node/devnet/v1/graphql',
      archive: 'https://api.minascan.io/archive/devnet/v1/graphql',
    });
    console.log('Devnet network instance configured.');
    Mina.setActiveInstance(Network);
  },
  async loadProgram() {
    const { Vote } = await import('zkvot-core');
    state.Program = Vote.Program;
  },
  async compileProgram() {
    await state.Program?.compile();
    await Aggregation.Program.compile();
  },
  async loadAndCompileContracts(
    electionStartBlock: number,
    electionFinalizeBlock: number,
    votersRoot: bigint
  ) {
    if (!state.ElectionContract) {
      const { Election } = await import('zkvot-core');
      console.log(
        'electionStartBlock',
        electionStartBlock,
        'electionFinalizeBlock',
        electionFinalizeBlock,
        'votersRoot',
        votersRoot
      );

      Election.setContractConstants({
        electionStartBlock,
        electionFinalizeBlock,
        votersRoot,
      });
      state.ElectionContract = Election.Contract;
    }
    console.log('Compiling ElectionContract');

    await state.ElectionContract.compile();
    console.log('ElectionContract compiled');
  },
  getElectionContractInstance(contractAddress: string) {
    if (!state.ElectionContract) {
      throw new Error(
        'ElectionContract not loaded. Call loadAndCompileContracts() first.'
      );
    }
    if (!state.ElectionContractInstance) {
      state.ElectionContractInstance = new state.ElectionContract(
        PublicKey.fromBase58(contractAddress)
      );
    }
    return state.ElectionContractInstance;
  },
  async createVote(data: {
    electionPubKey: string;
    nullifier: string;
    vote: number;
    votersArray: string[];
    publicKey: string;
  }): Promise<string> {
    if (!state.Program)
      throw new Error('Program not loaded. Call loadProgram() first.');

    console.log('data', data);

    const { electionPubKey, nullifier, vote, votersArray, publicKey } = data;

    const votersTree = MerkleTree.createFromStringArray(votersArray);
    console.log('votersTree', votersTree);

    if (!votersTree)
      throw new Error('Error creating voters tree from voters array.');

    const voterIndex = votersArray.indexOf(publicKey);
    if (voterIndex === -1) {
      throw new Error('Public key not found in voters array.');
    }

    const witness = votersTree.getWitness(BigInt(voterIndex));
    console.log('witness', witness);

    const votePublicInputs = new Vote.PublicInputs({
      electionPubKey: PublicKey.fromJSON(electionPubKey),
      vote: Field.from(vote),
      votersRoot: votersTree.getRoot(),
    });
    console.log('votePublicInputs', votePublicInputs);

    const votePrivateInputs = new Vote.PrivateInputs({
      voterKey: PublicKey.fromJSON(publicKey),
      nullifier: Nullifier.fromJSON(JSON.parse(nullifier)),
      votersMerkleWitness: new MerkleTree.Witness(witness),
    });
    console.log('votePrivateInputs', votePrivateInputs);

    console.time('vote proof generation');

    try {
      const voteProof = await state.Program.vote(
        votePublicInputs,
        votePrivateInputs
      );
      console.log('voteProof', voteProof);

      console.timeEnd('vote proof generation');

      const encodedVoteProof = await new Promise<string>((resolve, reject) => {
        encodeDataToBase64String(
          voteProof.proof.toJSON(),
          (error, base64String) => {
            if (error) {
              console.error('Error encoding vote proof:', error);
              reject(error);
            } else {
              console.log('Encoded Vote Proof:', base64String);
              if (base64String !== undefined) {
                resolve(base64String);
              } else {
                reject(new Error('Encoded vote proof is undefined'));
              }
            }
          }
        );
      });

      console.log('Returning encodedVoteProof:', encodedVoteProof);
      return encodedVoteProof;
    } catch (error) {
      console.error('Error generating zk-proof:', error);
      throw error;
    }
  },

  async deployElection(
    electionDeployer: string,
    electionStartBlock: number,
    electionFinalizeBlock: number,
    votersRoot: bigint,
    electionData: Election.StorageLayerInfoEncoding,
    settlementReward: number
  ) {
    try {
      const electionContractPrivKey = PrivateKey.random();
      const electionContractPubKey = electionContractPrivKey.toPublicKey();

      await this.loadAndCompileContracts(
        electionStartBlock,
        electionFinalizeBlock,
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
          await electionContract.initialize(electionData);
        }
      );
      await deployTx.prove();
      return deployTx.toJSON();
    } catch (error) {
      console.error('Error deploying election contract:', error);
    }
  },
};

Comlink.expose(api);

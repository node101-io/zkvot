import { AccountUpdate, Field, Mina, PublicKey, PrivateKey, Nullifier } from 'o1js';
import * as Comlink from 'comlink';

import { Aggregation, Election, MerkleTree, Vote } from 'zkvot-core';

import { Nullifier as NullifierType } from '@aurowallet/mina-provider';

import encodeDataToBase64String from '@/utils/encodeDataToBase64String.js';

const state = {
  Program: null as null | typeof Vote.Program,
  ElectionContract: null as null | typeof Election.Contract,
  ElectionContractInstance: null as null | Election.Contract,
};

export const api = {
  async setActiveInstanceToDevnet() {
    const Network = Mina.Network({
      mina: 'https://api.minascan.io/node/devnet/v1/graphql',
      archive: 'https://api.minascan.io/archive/devnet/v1/graphql',
    });
    console.log('Devnet network instance configured.');
    Mina.setActiveInstance(Network);
  },
  async setActiveInstanceToMainnet() {
    const Network = Mina.Network({
      mina: 'https://api.minascan.io/node/mainnet/v1/graphql',
      archive: 'https://api.minascan.io/archive/mainnet/v1/graphql',
    });
    console.log('Mainnet network instance configured.');
    Mina.setActiveInstance(Network);
  },
  async loadProgram() {
    const { Vote } = await import('zkvot-core');
    state.Program = Vote.Program;
  },
  async compileProgram() {
    await state.Program?.compile({ proofsEnabled: true });
    await Aggregation.Program.compile({ proofsEnabled: false });
  },
  async loadAndCompileContracts(
    electionStartBlock: number,
    electionFinalizeBlock: number,
    votersRoot: bigint
  ) {
    const { Election } = await import('zkvot-core');

    Election.setContractConstants({
      electionStartBlock,
      electionFinalizeBlock,
      votersRoot,
    });

    console.log('Compiling ElectionContract');
    await Election.Contract.compile();

    return Election.Contract;
  },
  async createVote(data: {
    electionPubKey: string;
    nullifier: NullifierType;
    vote: number;
    votersArray: string[];
    publicKey: string;
  }): Promise<string> {
    if (!state.Program)
      throw new Error('Program not loaded. Call loadProgram() first.');

    console.log('data', data);

    const { electionPubKey, nullifier, vote, votersArray, publicKey } = data;

    const votersTree = MerkleTree.createFromStringArray(votersArray);

    if (!votersTree)
      throw new Error('Error creating voters tree from voters array.');

    const voterIndex = MerkleTree.indexOf(votersArray, publicKey);
    if (voterIndex === -1) {
      throw new Error('Public key not found in voters array.');
    }

    const witness = votersTree.getWitness(BigInt(voterIndex));

    const votePublicInputs = new Vote.PublicInputs({
      electionPubKey: PublicKey.fromBase58(electionPubKey),
      vote: Field.from(vote),
      votersRoot: votersTree.getRoot(),
    });

    const votePrivateInputs = new Vote.PrivateInputs({
      voterKey: PublicKey.fromJSON(publicKey),
      nullifier: Nullifier.fromJSON(nullifier),
      votersMerkleWitness: new MerkleTree.Witness(witness),
    });

    try {
      const voteProof = await state.Program.vote(
        votePublicInputs,
        votePrivateInputs
      );

      console.timeEnd('vote proof generation');

      const encodedVoteProof = await new Promise<string>((resolve, reject) => {
        encodeDataToBase64String(
          voteProof.proof.toJSON(),
          (error, base64String) => {
            if (error) {
              console.error('Error encoding vote proof:', error);
              reject(error);
            } else {
              if (base64String !== undefined) {
                resolve(base64String);
              } else {
                reject(new Error('Encoded vote proof is undefined'));
              }
            }
          }
        );
      });

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
    electionStorageInfo: {
      first: bigint;
      last: bigint;
    },
    electionDataCommitment: bigint,
    settlementReward?: number
  ) {
    try {
      const electionContractPrivKey = PrivateKey.random();
      const electionContractPubKey = electionContractPrivKey.toPublicKey();

      const ElectionContract = await this.loadAndCompileContracts(
        electionStartBlock,
        electionFinalizeBlock,
        votersRoot
      );
      const ElectionContractInstance = new ElectionContract(electionContractPubKey);

      const deployTx = await Mina.transaction(
        {
          sender: PublicKey.fromBase58(electionDeployer),
          fee: 1e8
        },
        async () => {
          AccountUpdate.fundNewAccount(PublicKey.fromBase58(electionDeployer));
          await ElectionContractInstance.deploy();
          await ElectionContractInstance.initialize(
            {
              first: Field(electionStorageInfo.first),
              last: Field(electionStorageInfo.last)
            },
            Field.from(electionDataCommitment)
          );
        }
      );
      deployTx.sign([ electionContractPrivKey ]);
      const result = await deployTx.prove();

      if (!result) return;

      return {
        mina_contract_id: electionContractPubKey,
        txJSON: deployTx.toJSON()
      };
    } catch (error) {
      console.log(error);
      console.error('Error deploying election contract:', error);
    }
  },
};

Comlink.expose(api);

import { AccountUpdate, Field, Mina, PublicKey, PrivateKey, Nullifier } from 'o1js';
import * as Comlink from 'comlink';

import { MerkleTree, Vote } from 'zkvot-core';

import { Nullifier as NullifierType } from '@aurowallet/mina-provider';

import encodeDataToBase64String from '@/utils/encodeDataToBase64String.js';

const state = {
  Program: null as typeof Vote.Program | null,
  isAggregationProgramCompiled: false
};

export const api = {
  async setActiveInstance(data: { devnet?: boolean }) {
    const Network = Mina.Network({
      mina: `https://api.minascan.io/node/${data.devnet ? 'devnet' : 'mainnet'}/v1/graphql`,
      archive: `https://api.minascan.io/archive/${data.devnet ? 'devnet' : 'mainnet'}/v1/graphql`,
    });

    Mina.setActiveInstance(Network);
  },
  async loadAndCompileVoteProgram() {
    const { Vote } = await import('zkvot-core');

    state.Program = Vote.Program;

    console.log('Compiling VoteProgram');
    console.time('Compiling VoteProgram');
    await state.Program.compile({ proofsEnabled: true });
    console.timeEnd('Compiling VoteProgram');
  },
  async loadAndCompileElectionContract(
    electionStartBlock: number,
    electionFinalizeBlock: number,
    votersRoot: bigint
  ) {
    const { Aggregation, Election } = await import('zkvot-core');

    console.log('Compiling AggregationProgram');
    console.time('Compiling AggregationProgram');
    if (!state.isAggregationProgramCompiled) {
      await Aggregation.Program.compile({ proofsEnabled: true });
      state.isAggregationProgramCompiled = true;
    }
    console.timeEnd('Compiling AggregationProgram');

    Election.setContractConstants({
      electionStartBlock,
      electionFinalizeBlock,
      votersRoot
    });

    console.log('Compiling ElectionContract');
    console.time('Compiling ElectionContract');
    await Election.Contract.compile();
    console.timeEnd('Compiling ElectionContract');

    return Election.Contract;
  },
  async createVote(data: {
    electionPubKey: string;
    nullifier: NullifierType;
    vote: number;
    votersArray: string[];
    publicKey: string;
  }) {
    if (!state.Program)
      throw new Error('Program not loaded. Call loadProgram() first.');

    const votersTree = MerkleTree.createFromStringArray(data.votersArray);

    if (!votersTree)
      throw new Error('Error creating voters tree from voters array.');

    const voterIndex = MerkleTree.indexOf(data.votersArray, data.publicKey);
    if (voterIndex === -1) {
      throw new Error('Public key not found in voters array.');
    }

    const witness = votersTree.getWitness(BigInt(voterIndex));

    const votePublicInputs = new Vote.PublicInputs({
      electionPubKey: PublicKey.fromBase58(data.electionPubKey),
      vote: Field.from(data.vote),
      votersRoot: votersTree.getRoot(),
    });

    const votePrivateInputs = new Vote.PrivateInputs({
      voterKey: PublicKey.fromJSON(data.publicKey),
      nullifier: Nullifier.fromJSON(data.nullifier),
      votersMerkleWitness: new MerkleTree.Witness(witness),
    });

    try {
      console.time('Generating vote proof');
      const voteProof = await state.Program.vote(
        votePublicInputs,
        votePrivateInputs
      );
      console.timeEnd('Generating vote proof');

      const encodedVoteProof = await new Promise<string>((resolve, reject) => {
        encodeDataToBase64String(voteProof.proof.toJSON(), (err, base64String) => {
          if (err)
            return reject(err);

          if (!base64String)
            return reject('Error encoding proof to base64 string');

          return resolve(base64String);
        });
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

      const ElectionContract = await this.loadAndCompileElectionContract(
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
        mina_contract_id: electionContractPubKey.toBase58(),
        txJSON: deployTx.toJSON()
      };
    } catch (error) {
      console.log(error);
      console.error('Error deploying election contract:', error);
    }
  }
};

Comlink.expose(api);

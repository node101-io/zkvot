import * as Comlink from 'comlink';

import { Election } from 'zkvot-core';

import { Nullifier } from '@aurowallet/mina-provider';

export default class {
  worker: Worker;
  remoteApi: Comlink.Remote<typeof import('@/utils/ZKProgramWorker.js').api>;

  constructor() {
    const worker = new Worker(
      new URL('@/utils/ZKProgramWorker.js', import.meta.url),
      {
        type: 'module',
      }
    );
    this.remoteApi = Comlink.wrap(worker);
  }

  setActiveInstanceToDevnet() {
    return this.remoteApi.setActiveInstanceToDevnet();
  }

  setActiveInstanceToMainnet() {
    return this.remoteApi.setActiveInstanceToMainnet();
  }

  async loadProgram() {
    return this.remoteApi.loadProgram();
  }

  async compileProgram() {
    return this.remoteApi.compileProgram();
  }

  async createVote(data: {
    electionPubKey: string;
    nullifier: Nullifier;
    vote: number;
    votersArray: string[];
    publicKey: string;
  }) {
    const result = await this.remoteApi.createVote(data);

    return result;
  }

  async deployElection(
    electionDeployer: string,
    electionStartBlock: number,
    electionFinalizeBlock: number,
    votersRoot: bigint,
    electionData: Election.StorageLayerInfoEncoding,
    settlementReward?: number
  ) {
    const result = await this.remoteApi.deployElection(
      electionDeployer,
      electionStartBlock,
      electionFinalizeBlock,
      votersRoot,
      {
        first: electionData.first.toBigInt(),
        last: electionData.last.toBigInt(),
      },
      settlementReward || 0
    );

    return result;
  }

  async loadAndCompileContracts(
    electionStartBlock: number,
    electionFinalizeBlock: number,
    votersRoot: bigint
  ) {
    return this.remoteApi.loadAndCompileContracts(
      electionStartBlock,
      electionFinalizeBlock,
      votersRoot
    );
  }
}

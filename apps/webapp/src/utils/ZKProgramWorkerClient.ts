import * as Comlink from 'comlink';

import { Election } from 'zkvot-core';

import { Nullifier } from '@aurowallet/mina-provider';
import { Field } from 'o1js';

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
  async setActiveInstance({ devnet }: { devnet?: boolean }) {
    return this.remoteApi.setActiveInstance({ devnet });
  }
  async loadAndCompileVoteProgram() {
    return this.remoteApi.loadAndCompileVoteProgram();
  }
  async loadAndCompileAggregationProgram() {
    return this.remoteApi.loadAndCompileAggregationProgram();
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
    electionStartSlot: number,
    electionFinalizeSlot: number,
    votersRoot: bigint,
    electionStorageInfo: Election.StorageLayerInfoEncoding,
    electionDataCommitment: Field,
    settlementReward?: number
  ) {
    const result = await this.remoteApi.deployElection(
      electionDeployer,
      electionStartSlot,
      electionFinalizeSlot,
      votersRoot,
      {
        first: electionStorageInfo.first.toBigInt(),
        last: electionStorageInfo.last.toBigInt(),
      },
      electionDataCommitment.toBigInt(),
      settlementReward || 0
    );

    return result;
  }
  async loadAndCompileElectionContract(
    electionStartSlot: number,
    electionFinalizeSlot: number,
    votersRoot: bigint
  ) {
    return this.remoteApi.loadAndCompileElectionContract(
      electionStartSlot,
      electionFinalizeSlot,
      votersRoot
    );
  }
  async verifyElectionVerificationKeyOnChain(
    electionPubKey: string,
    electionStartSlot: number,
    electionFinalizeSlot: number,
    votersRoot: bigint
  ) {
    return this.remoteApi.verifyElectionVerificationKeyOnChain(
      electionPubKey,
      electionStartSlot,
      electionFinalizeSlot,
      votersRoot
    );
  }
  getVerificationKey() {
    return this.remoteApi.getVerificationKey();
  }
}

import * as Comlink from 'comlink';

export default class {
  worker: Worker;
  remoteApi: Comlink.Remote<typeof import('@/utils/ZKProgramWorker.js').api>;

  constructor() {
    const worker = new Worker(new URL('@/utils/zkProgram/zkProgramWorker.js', import.meta.url), {
      type: 'module',
    });
    this.remoteApi = Comlink.wrap(worker);
  };

  async loadProgram() {
    return this.remoteApi.loadProgram();
  };

  async compileProgram() {
    return this.remoteApi.compileProgram();
  };

  async createVote(data: {
    electionId: string;
    signedElectionId: string;
    vote: number;
    votersArray: string[];
    publicKey: string;
  }) {
    const result = await this.remoteApi.createVote(data);

    return result;
  };

  async deployElection(
    electionDeployer: string,
    electionStartBlock: number,
    electionFinalizeBlelectionStartBlock: number,
    votersRoot: bigint,
    electionData: {
      first: bigint;
      last: bigint;
    },
    settlementReward: number
  ) {
    const result = await this.remoteApi.deployElection(
      electionDeployer,
      electionStartBlock,
      electionFinalizeBlelectionStartBlock,
      votersRoot,
      electionData,
      settlementReward
    );

    return result;
  };

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
  };
};

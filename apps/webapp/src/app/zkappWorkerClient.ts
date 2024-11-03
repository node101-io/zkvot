import * as Comlink from "comlink";

export default class ZkappWorkerClient {
  worker: Worker;
  remoteApi: Comlink.Remote<typeof import("./zkappWorker.js").api>;

  constructor() {
    const worker = new Worker(new URL("./zkappWorker.ts", import.meta.url), {
      type: "module",
    });
    this.remoteApi = Comlink.wrap(worker);
  }

  async loadProgram() {
    return this.remoteApi.loadProgram();
  }

  async compileProgram() {
    return this.remoteApi.compileProgram();
  }

  async createVote(data: any) {
    const result = await this.remoteApi.createVote(data);

    return result;
  }
}

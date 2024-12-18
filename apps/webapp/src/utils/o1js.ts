import { fetchAccount, fetchLastBlock, verify } from 'o1js';

import { AggregationMM as Aggregation, Vote } from 'zkvot-core';

const MINA_APPROXIMATE_BLOCK_TIME = 3 * 60 * 1000;
const MINA_RPC_URL = `https://api.minascan.io/node/${
  !!process.env.DEVNET ? 'devnet' : 'mainnet'
}/v1/graphql`;

let lastBlockHeight: number;
let lastRequestTime: number;

let lastSlot: number;
let lastSlotRequestTime: number;

export const calculateBlockHeightFromTimestamp = async (
  startTimeStamp: Date,
  endTimeStamp: Date
): Promise<{
  startBlockHeight: number;
  endBlockHeight: number;
}> => {
  try {
    if (
      !lastRequestTime ||
      !lastBlockHeight ||
      Date.now() - lastRequestTime > MINA_APPROXIMATE_BLOCK_TIME
    ) {
      lastBlockHeight = Number(
        (await fetchLastBlock(MINA_RPC_URL)).blockchainLength.toBigint()
      );
      lastRequestTime = Date.now();
    }

    let startBlockHeight;
    let endBlockHeight;

    if (startTimeStamp.valueOf() > Date.now())
      startBlockHeight =
        Math.ceil(
          (new Date(startTimeStamp).valueOf() - Date.now()) /
            MINA_APPROXIMATE_BLOCK_TIME
        ) + lastBlockHeight;
    else
      startBlockHeight =
        Math.floor(
          (new Date(startTimeStamp).valueOf() - Date.now()) /
            MINA_APPROXIMATE_BLOCK_TIME
        ) + lastBlockHeight;

    if (endTimeStamp.valueOf() > Date.now())
      endBlockHeight =
        Math.ceil(
          (new Date(endTimeStamp).valueOf() - Date.now()) /
            MINA_APPROXIMATE_BLOCK_TIME
        ) + lastBlockHeight;
    else
      endBlockHeight =
        Math.floor(
          (new Date(endTimeStamp).valueOf() - Date.now()) /
            MINA_APPROXIMATE_BLOCK_TIME
        ) + lastBlockHeight;

    return {
      startBlockHeight,
      endBlockHeight,
    };
  } catch (error) {
    throw new Error('Failed to calculate block height');
  }
};

export const calculateSlotFromTimestamp = async (
  startTimeStamp: Date,
  endTimeStamp: Date
): Promise<{
  startSlot: number;
  endSlot: number;
}> => {
  try {
    if (
      !lastSlotRequestTime ||
      !lastSlot ||
      Date.now() - lastSlotRequestTime > MINA_APPROXIMATE_BLOCK_TIME
    ) {
      lastSlot = Number(
        (await fetchLastBlock(MINA_RPC_URL)).globalSlotSinceGenesis.toBigint()
      );
      lastSlotRequestTime = Date.now();
    }

    let startSlot;
    let endSlot;

    if (startTimeStamp.valueOf() > Date.now())
      startSlot =
        Math.ceil(
          (new Date(startTimeStamp).valueOf() - Date.now()) /
            MINA_APPROXIMATE_BLOCK_TIME
        ) + lastSlot;
    else
      startSlot =
        Math.floor(
          (new Date(startTimeStamp).valueOf() - Date.now()) /
            MINA_APPROXIMATE_BLOCK_TIME
        ) + lastSlot;

    if (endTimeStamp.valueOf() > Date.now())
      endSlot =
        Math.ceil(
          (new Date(endTimeStamp).valueOf() - Date.now()) /
            MINA_APPROXIMATE_BLOCK_TIME
        ) + lastSlot;
    else
      endSlot =
        Math.floor(
          (new Date(endTimeStamp).valueOf() - Date.now()) /
            MINA_APPROXIMATE_BLOCK_TIME
        ) + lastSlot;

    return {
      startSlot,
      endSlot,
    };
  } catch (error) {
    throw new Error('Failed to calculate slot time');
  }
};

export const verifyAggregationProof = async (
  proofJSON: string,
  verification_key: string,
  mina_contract_id: string,
  voters_merkle_root: string,
  options_length: number,
  result: number[]
): Promise<boolean> => {
  if (!proofJSON.trim().length) return false;

  try {
    const proof = await Aggregation.Proof.fromJSON(JSON.parse(proofJSON));

    if (!proof) return false;

    if (proof.publicInput.electionPubKey.toBase58() !== mina_contract_id)
      return false;

    if (
      proof.publicInput.votersRoot.toBigInt().toString() !== voters_merkle_root
    )
      return false;

    const proofResults = new Vote.VoteOptions({
      voteOptions_1: proof.publicOutput.voteOptions_1,
      voteOptions_2: proof.publicOutput.voteOptions_2,
      voteOptions_3: proof.publicOutput.voteOptions_3,
    })
      .toResults()
      .slice(0, options_length);

    if (
      options_length !== result.length ||
      proofResults.findIndex((any, index) => result[index] !== any) > -1
    )
      return false;

    if (!(await verify(proof, JSON.parse(verification_key)))) return false;

    return true;
  } catch (error) {
    console.log(`Soft finality proof verification failed: ${error}`);
    return false;
  }
};

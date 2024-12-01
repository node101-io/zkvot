import { fetchLastBlock } from 'o1js';

const MINA_APPROXIMATE_BLOCK_TIME = 3 * 60 * 1000;
const MINA_RPC_URL = 'https://api.minascan.io/node/devnet/v1/graphql';

let lastBlockHeight: number;
let lastRequestTime: number;

export default async function calculateBlockHeight(
  startTimeStamp: Date,
  endTimeStamp: Date
): Promise<{
  startBlockHeight: number;
  endBlockHeight: number;
}> {
  try {
    if (!lastRequestTime || (Date.now() - lastRequestTime) > MINA_APPROXIMATE_BLOCK_TIME) {
      lastBlockHeight = Number((await fetchLastBlock(MINA_RPC_URL)).blockchainLength.toBigint());
      lastRequestTime = Date.now();
    };
  
    let startBlockHeight;
    let endBlockHeight;
  
    if (startTimeStamp.valueOf() > Date.now())
      startBlockHeight = Math.ceil((startTimeStamp.valueOf() - Date.now()) / MINA_APPROXIMATE_BLOCK_TIME) + lastBlockHeight;
    else
      startBlockHeight = Math.floor((startTimeStamp.valueOf() - Date.now()) / MINA_APPROXIMATE_BLOCK_TIME) + lastBlockHeight;
  
    if (endTimeStamp.valueOf() > Date.now())
      endBlockHeight = Math.ceil((endTimeStamp.valueOf() - Date.now()) / MINA_APPROXIMATE_BLOCK_TIME) + lastBlockHeight;
    else
      endBlockHeight = Math.floor((endTimeStamp.valueOf() - Date.now()) / MINA_APPROXIMATE_BLOCK_TIME) + lastBlockHeight;
  
    return {
      startBlockHeight,
      endBlockHeight,
    };
  } catch (error) {
    throw new Error('Failed to calculate block height');
  } 
}

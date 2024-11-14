import { ApiPromise, WsProvider } from "@polkadot/api";
import { Request, Response } from 'express';

const AVAIL_MAINNET_RPC = 'wss://turing-rpc.avail.so/ws';
const BLOCK_INFO_CACHE_TIME = 5 * 60 * 1000;

let lastBlockHeight: string;
let lastRequestTime: number;

export default async (
  req: Request,
  res: Response
) => {
  if (lastBlockHeight && Date.now() - lastRequestTime < BLOCK_INFO_CACHE_TIME) {
    res.json({
      success: true,
      block_height: lastBlockHeight,
    });
    return;
  }

  try {
    const wsProvider = new WsProvider(AVAIL_MAINNET_RPC);
    const api = await ApiPromise.create({ provider: wsProvider });
    const signedBlock = await api.rpc.chain.getBlock();
    const block_height = signedBlock.block.header.number.toString();

    lastBlockHeight = block_height;
    lastRequestTime = Date.now();

    res.json({
      success: true,
      block_height,
    });
    return;
  } catch (error) {
    console.error("Error fetching Avail block height:", error);
    res.json({
      success: false,
      error: 'avail_fetch_error',
    });
    return;
  }
};

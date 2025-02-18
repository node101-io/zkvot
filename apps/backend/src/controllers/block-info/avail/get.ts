import { Request, Response } from 'express';

import { utils } from 'zkvot-backend-utils';

const BLOCK_INFO_CACHE_TIME = 5 * 60 * 1000;

let lastBlockHeight: string;
let lastRequestTime: number;

export default async (req: Request, res: Response) => {
  if (lastBlockHeight && Date.now() - lastRequestTime < BLOCK_INFO_CACHE_TIME) {
    res.json({
      success: true,
      block_height: lastBlockHeight,
    });
    return;
  };

  try {
    const response = await fetch(`${'is_devnet' in req.query ? utils.avail.config.devnet.rpcEndpoint : utils.avail.config.mainnet.rpcEndpoint}/v2/status`);
    const block_height = (await response.json()).blocks.latest;

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

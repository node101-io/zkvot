import { Request, Response } from "express";

const CELESTIA_MAINNET_RPC = "https://rpc-mocha.pops.one/block";

export default (_req: Request, res: Response) => {
  fetch(CELESTIA_MAINNET_RPC, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "block",
      params: [],
      id: 1,
    }),
  })
    .then(response => response.json())
    .then(result => {
      const blockHeight = result?.result?.block?.header?.height;
      const blockHash = result?.result?.block_id?.hash;

      if (!blockHeight || !blockHash)
        return res.status(500).json({
          success: false,
          error: "block_info_not_found",
        });

      res.json({
        success: true,
        block_height: blockHeight,
        block_hash: blockHash,
      });
    })
    .catch(error => {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    });
};

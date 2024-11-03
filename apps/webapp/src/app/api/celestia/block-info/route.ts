import { NextResponse } from "next/server.js";

interface BlockInfo {
  block_height: number;
  block_hash: string;
};

const CELESTIA_MAINNET_RPC = "https://rpc-mocha.pops.one/block";
const BLOCK_INFO_CACHE_TIME = 1000 * 60 * 5;

let lastResponse: BlockInfo;
let lastRequestTime: number;

export async function GET() {
  try {
    if (lastResponse && Date.now() - lastRequestTime < BLOCK_INFO_CACHE_TIME)
      return NextResponse.json({
        success: true,
        ...lastResponse,
      });

    const response = await fetch(CELESTIA_MAINNET_RPC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "block",
        params: [],
        id : 1
      })
    });
    const result = await response.json();

    const blockHeight = result?.result?.block?.header?.height;
    const blockHash = result?.result?.block_id?.hash;

    if (!blockHeight || !blockHash)
      return NextResponse.json({
        success: false,
        error: "block_info_not_found",
      });

    lastResponse = {
      block_height: blockHeight,
      block_hash: blockHash,
    };

    return NextResponse.json({
      success: true,
      ...lastResponse,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  };
};

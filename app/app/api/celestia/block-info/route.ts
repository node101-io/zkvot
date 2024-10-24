import { NextResponse } from "next/server";

const CELESTIA_MAINNET_RPC = "https://rpc-mocha.pops.one/block";

export async function GET() {
  try {
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

    return NextResponse.json({
      success: true,
      block_height: blockHeight,
      block_hash: blockHash,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
};

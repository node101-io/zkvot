export default async (req, res) => {
  try {
    const response = await fetch("https://rpc-mocha.pops.one/block", {
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
    });

    const result = await response.json();

    if (result.result) {
      const block = result.result.block;
      const blockHeight = block.header.height;
      const blockHash = result.result.block_id.hash;

      res.json({
        success: true,
        block_height: blockHeight,
        block_hash: blockHash,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to get block data",
      });
    }
  } catch (error) {
    console.error("Error fetching Ceaaaaalestia block data:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

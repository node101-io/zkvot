import { ApiPromise, WsProvider } from "@polkadot/api";

export const fetchAvailBlockHeight = async () => {
  try {
    const wsProvider = new WsProvider("wss://turing-rpc.avail.so/ws");
    const api = await ApiPromise.create({ provider: wsProvider });
    const signedBlock = await api.rpc.chain.getBlock();
    const height = signedBlock.block.header.number.toString();
    return height;
  } catch (error) {
    console.error("Error fetching Avail block height:", error);
    throw error;
  }
};

export const fetchCelestiaBlockInfo = async () => {
  try {
    const response = await fetch("/celestia-block-info");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error fetching Celestia block data: ${errorText}`);
    }

    const result = await response.json();

    if (result.success) {
      return {
        blockHeight: result.block_height,
        blockHash: result.block_hash,
      };
    } else {
      throw new Error(`Error in response data: ${result.error}`);
    }
  } catch (error) {
    console.error("Error fetching Celestia block data:", error);
    throw error;
  }
};

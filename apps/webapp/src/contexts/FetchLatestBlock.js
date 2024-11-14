export const fetchAvailBlockHeight = async () => {
  try {
    const response = await fetch("https://backend.zkvot.io/api/block-info/avail");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error fetching Avail block data: ${errorText}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.block_height;
    } else {
      throw new Error(`Error in response data: ${result.error}`);
    }
  } catch (error) {
    console.error("Error fetching Avail block data:", error);
    throw error;
  }
};

export const fetchCelestiaBlockInfo = async () => {
  try {
    const response = await fetch("https://backend.zkvot.io/api/block-info/celestia");

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

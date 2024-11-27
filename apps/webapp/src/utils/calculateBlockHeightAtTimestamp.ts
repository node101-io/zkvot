import { fetchLastBlock, Mina } from "o1js";

export default async function calculateBlockHeight(
  startTimeStamp: number,
  endTimeStamp: number
) {
  // const Network = Mina.Network({
  //   mina:,
  //   archive: "https://api.minascan.io/archive/devnet/v1/graphql",
  // });
  // Mina.setActiveInstance(Network);
  const latestBlock = await fetchLastBlock(
    "https://api.minascan.io/node/devnet/v1/graphql"
  );
  const blockTime = 3 * 60 * 1000;
  const currentBlockHeight = Number(latestBlock.blockchainLength.toBigint());

  let startBlockHeight;
  let endBlockHeight;
  if (startTimeStamp > Date.now()) {
    startBlockHeight =
      Math.ceil((startTimeStamp - Date.now()) / blockTime) + currentBlockHeight;
  } else {
    startBlockHeight =
      Math.floor((startTimeStamp - Date.now()) / blockTime) +
      currentBlockHeight;
  }

  if (endTimeStamp > Date.now()) {
    endBlockHeight =
      Math.ceil((endTimeStamp - Date.now()) / blockTime) + currentBlockHeight;
  } else {
    endBlockHeight =
      Math.floor((endTimeStamp - Date.now()) / blockTime) + currentBlockHeight;
  }

  return {
    startBlockHeight,
    endBlockHeight,
  };
}

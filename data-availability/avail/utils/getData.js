const initializeAvail = require('./initialize');

module.exports = async (blockHash, txHash) => {
  const { initializedAPI } = await initializeAvail();

  const block = await initializedAPI.rpc.chain.getBlock(blockHash);
  const tx = block.block.extrinsics.find(
    (tx) => tx.hash.toHex() == txHash
  );

  if (!tx)
    return 'tx_not_found';

  const dataHex = tx.method.args.map((arg) => arg.toString()).join(', ');

  let submittedData = '';
  for (let i = 0; i < dataHex.length; i += 2)
    submittedData += String.fromCharCode(
      parseInt(dataHex.substring(i, i + 2), 16)
    );

  return submittedData;
};
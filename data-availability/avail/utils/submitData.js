const initializeAvail = require('./initializeAvail');

module.exports = async (data) => {
  const { initializedAPI, clientAccount, options } = await initializeAvail();

  const txResult = await new Promise((resolve) => {
    initializedAPI.tx.dataAvailability
      .submitData(data)
      .signAndSend(
        clientAccount,
        options,
        (result) => {
          if (result.isFinalized || result.isError)
            resolve(result);
        }
      );
  });

  if (txResult.isError)
    return 'tx_failed_error';

  const blockHash = txResult.status.asFinalized;
  const txHash = txResult.txHash;

  const possibleTxError = txResult.dispatchError;

  if (possibleTxError) {
    if (possibleTxError.isModule) {
      const decodedError = initializedAPI.registry.findMetaError(possibleTxError.asModule);
      const { documentation, name, section } = decodedError;

      return {
        success: false,
        blockHash,
        txHash,
        error: {
          name,
          section,
          documentation
        }
      };
    } else {
      return {
        success: false,
        blockHash,
        txHash,
        error: possibleTxError.toString()
      };
    };
  };

  return {
    success: true,
    blockHash: blockHash.toHex(),
    txHash: txHash.toHex()
  };
};
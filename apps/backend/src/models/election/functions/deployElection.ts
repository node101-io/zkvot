import { PrivateKey, Mina, Field, AccountUpdate } from "o1js";
import {
  ElectionContract,
  ElectionData,
  RangeAggregationProgram,
  setElectionContractConstants,
  Vote,
} from "zkvot-contracts";

export default async function deploy(
  startBlock: number,
  endBlock: number,
  votersRoot: Field,
  fileCoinDatas: Field[],
  publisherPrivateKey: PrivateKey
) {
  const Network = Mina.Network({
    mina: "https://api.minascan.io/node/devnet/v1/graphql",
    archive: "https://api.minascan.io/archive/devnet/v1/graphql",
  });
  Mina.setActiveInstance(Network);

  const publisherPubKey = publisherPrivateKey.toPublicKey();

  setElectionContractConstants({
    electionStartBlock: startBlock,
    electionFinalizeBlock: endBlock,
    votersRoot: votersRoot.toBigInt(),
  });

  console.time("Compile Vote Program");
  await Vote.compile();
  console.timeEnd("Compile Vote Program");

  console.time("Compile Aggregate Program");
  await RangeAggregationProgram.compile();
  console.timeEnd("Compile Aggregate Program");

  console.time("Compile Election Contract");
  await ElectionContract.compile();
  console.timeEnd("Compile Election Contract");

  const electionContractPk = PrivateKey.random();
  const electionContractPubKey = electionContractPk.toPublicKey();

  const electionContractInstance = new ElectionContract(electionContractPubKey);

  const electionData = new ElectionData({
    first: fileCoinDatas[0],
    last: fileCoinDatas[1],
  });

  const deployTx = await Mina.transaction(
    {
      sender: publisherPubKey,
      fee: 1e8,
    },
    async () => {
      AccountUpdate.fundNewAccount(publisherPubKey);
      await electionContractInstance.deploy();
      await electionContractInstance.initialize(electionData);
    }
  );

  deployTx.sign([publisherPrivateKey, electionContractPk]);

  await deployTx.prove();

  let pendingTransaction = await deployTx.send();

  if (pendingTransaction.status === "rejected") {
    throw new Error("error sending transaction");
  }

  await pendingTransaction.wait();

  return {
    contractPrivateKey: electionContractPk,
    contractPublicKey: electionContractPubKey,
    transactionHash: pendingTransaction.hash,
  };
}

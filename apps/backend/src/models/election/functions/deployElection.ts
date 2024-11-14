import { PrivateKey, Mina, Field, AccountUpdate } from "o1js";
import {
  ElectionContract,
  ElectionData,
  RangeAggregationProgram,
  setElectionContractConstants,
  Vote,
} from "zkvot-contracts";

const MINA_PRIVATE_KEY = PrivateKey.fromBase58(process.env.MINA_PRIVATE_KEY || '');

async function deploy(
  startBlock: number,
  endBlock: number,
  votersRoot: Field,
  storageLayerFieldEncoding: [Field, Field],
) {
  const Network = Mina.Network({
    mina: "https://api.minascan.io/node/devnet/v1/graphql",
    archive: "https://api.minascan.io/archive/devnet/v1/graphql",
  });
  Mina.setActiveInstance(Network);

  const publisherPubKey = MINA_PRIVATE_KEY.toPublicKey();

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
    first: storageLayerFieldEncoding[0],
    last: storageLayerFieldEncoding[1],
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

  deployTx.sign([MINA_PRIVATE_KEY, electionContractPk]);

  await deployTx.prove();

  let pendingTransaction = await deployTx.send();

  if (pendingTransaction.status === "rejected") {
    throw new Error("error sending transaction");
  }

  await pendingTransaction.wait();

  return {
    contractPublicKey: electionContractPubKey.toBase58(),
    transactionHash: pendingTransaction.hash,
  };
}

export default async (
  data: {
    startBlock: number,
    endBlock: number,
    votersRoot: bigint,
    storageLayerFieldEncoding: [Field, Field],
  },
  callback: (
    error: string | null,
    result?: {
      contractPublicKey: string,
      transactionHash: string
    }
  ) => any
) => {
  try {
    const result = await deploy(
      data.startBlock,
      data.endBlock,
      Field(data.votersRoot),
      data.storageLayerFieldEncoding
    );

    return callback(null, result);
  } catch (err) {
    return callback('mina_deploy_error');
  }
}
import {
  PrivateKey,
  Mina,
  Field,
  AccountUpdate,
  PublicKey,
  Poseidon,
  MerkleTree,
} from "o1js";
import { Vote } from "./VoteProgram.js";
import {
  ElectionContract,
  ElectionData,
  setElectionContractConstants,
} from "./ElectionContract.js";
import { RangeAggregationProgram } from "./RangeAggregationProgram.js";

/**
 * @param startBlock start Block of the election
 * @param endBlock end Block of the election
 * @param votersList pubkey list of the voters
 * @param fileCoinDatas filecoin data of the election give 2 fields
 */
export default async function deploy(
  startBlock: number,
  endBlock: number,
  votersList: PublicKey[],
  fileCoinDatas: Field[]
) {
  const Network = Mina.Network({
    mina: "https://api.minascan.io/node/devnet/v1/graphql",
    archive: "https://api.minascan.io/archive/devnet/v1/graphql",
  });
  Mina.setActiveInstance(Network);

  votersList = votersList.sort((a, b) => {
    if (
      Poseidon.hash(a.toFields()).toBigInt() <
      Poseidon.hash(b.toFields()).toBigInt()
    ) {
      return -1;
    }
    if (
      Poseidon.hash(a.toFields()).toBigInt() >
      Poseidon.hash(b.toFields()).toBigInt()
    ) {
      return 1;
    }
    return 0;
  });

  let votersTree = new MerkleTree(20);

  for (let i = 0; i < votersList.length; i++) {
    let leaf = Poseidon.hash(votersList[i].toFields());
    votersTree.setLeaf(BigInt(i), leaf);
  }

  let votersRoot = votersTree.getRoot();
  console.log(`Voters root: ${votersRoot.toString()}`);

  const publisherPrivateKey = PrivateKey.fromBase58(
    "BURAYA ICINDE MINA OLAN PRIV KEY GIRIN"
  );
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
  console.log(electionContractPk.toBase58());
  const electionContractPubKey = electionContractPk.toPublicKey();
  console.log(electionContractPubKey.toBase58());

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
    console.log("error sending transaction (see above)");
    process.exit(0);
  }

  console.log(
    `See transaction at https://minascan.io/devnet/tx/${pendingTransaction.hash}`
  );

  await pendingTransaction.wait();

  console.log("Contract deployed at", electionContractPubKey.toBase58());
}

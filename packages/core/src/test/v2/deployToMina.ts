import {
  AccountUpdate,
  Field,
  MerkleTree,
  Mina,
  Poseidon,
  PrivateKey,
  UInt32,
  UInt64,
} from 'o1js';

import Aggregation from '../../aggregation-programs/AggregationMM.js';
import Election from '../../election-contracts/ElectionRunner.js';
import ElectionController from '../../election-contracts/ElectionController.js';
import Vote from '../../vote/Vote.js';
import { votersList } from '../mock.js';

/**
 * @param startSlot start Slot of the election
 * @param endSlot end Slot of the election
 * @param fileCoinDatas filecoin data of the election give 2 fields
 * @param storageLayerCommitment storage layer commitment
 * @param publisherPrivateKey private key of the publisher
 */
export default async function deploy(
  startSlot: number,
  endSlot: number,
  fileCoinDatas: Field[],
  storageLayerCommitment: Field,
  publisherPrivateKey: PrivateKey
) {
  const Network = Mina.Network({
    mina: 'https://api.minascan.io/node/devnet/v1/graphql',
    archive: 'https://api.minascan.io/archive/devnet/v1/graphql',
  });
  Mina.setActiveInstance(Network);

  votersList.sort((a, b) => {
    if (
      Poseidon.hash(a[1].toFields()).toBigInt() <
      Poseidon.hash(b[1].toFields()).toBigInt()
    ) {
      return -1;
    }
    if (
      Poseidon.hash(a[1].toFields()).toBigInt() >
      Poseidon.hash(b[1].toFields()).toBigInt()
    ) {
      return 1;
    }
    return 0;
  });

  let votersTree = new MerkleTree(20);

  for (let i = 0; i < 4; i++) {
    let leaf = Poseidon.hash(votersList[i][1].toFields());
    votersTree.setLeaf(BigInt(i), leaf);
  }

  if (!votersTree) throw new Error('Error creating voters tree');

  let votersRoot = votersTree.getRoot();
  console.log(`Voters root: ${votersRoot.toString()}`);

  const publisherPubKey = publisherPrivateKey.toPublicKey();

  const electionContractPk = PrivateKey.random();
  console.log(electionContractPk.toBase58());
  const electionContractPubKey = electionContractPk.toPublicKey();
  console.log(electionContractPubKey.toBase58());

  const electionControllerPk = PrivateKey.random();
  console.log(electionControllerPk.toBase58());
  const electionControllerPubKey = electionControllerPk.toPublicKey();
  console.log(electionControllerPubKey.toBase58());

  const electionContractInstance = new Election.Contract(
    electionContractPubKey
  );

  const electionControllerInstance = new ElectionController.Contract(
    electionControllerPubKey
  );

  Election.BatchReducerInstance.setContractInstance(electionContractInstance);

  console.time('Compile Vote Program');
  await Vote.Program.compile();
  console.timeEnd('Compile Vote Program');

  console.time('Compile Aggregate Program');
  await Aggregation.Program.compile();
  console.timeEnd('Compile Aggregate Program');

  console.time('Compile Election Controller');
  await ElectionController.Contract.compile();
  console.timeEnd('Compile Election Controller');

  console.time('Compile Election Batch Reducer');
  await Election.BatchReducerInstance.compile();
  console.timeEnd('Compile Election Batch Reducer');

  console.time('Compile Election Contract');
  await Election.Contract.compile();
  console.timeEnd('Compile Election Contract');

  console.time('Compile Election Contract');
  await Election.Contract.compile();
  console.timeEnd('Compile Election Contract');

  const electionData = new ElectionController.StorageLayerInfoEncoding({
    first: fileCoinDatas[0],
    last: fileCoinDatas[1],
  });

  const deployTx = await Mina.transaction(
    {
      sender: publisherPubKey,
      fee: 1e8,
    },
    async () => {
      AccountUpdate.fundNewAccount(publisherPubKey, 2);
      await electionControllerInstance.deploy();
      await electionControllerInstance.initialize(
        electionData,
        storageLayerCommitment,
        votersRoot,
        UInt32.from(startSlot),
        UInt32.from(endSlot)
      );
      await electionContractInstance.deploy();
      await electionContractInstance.initialize(
        electionControllerPubKey,
        UInt64.from(1e9)
      );
    }
  );

  deployTx.sign([
    publisherPrivateKey,
    electionContractPk,
    electionControllerPk,
  ]);

  await deployTx.prove();

  let pendingTransaction = await deployTx.send();

  if (pendingTransaction.status === 'rejected') {
    console.log('error sending transaction (see above)');
    process.exit(0);
  }

  console.log(
    `See transaction at https://minascan.io/devnet/tx/${pendingTransaction.hash}`
  );

  await pendingTransaction.wait();

  console.log('Contract deployed at', electionContractPubKey.toBase58());

  return { electionContractPk, electionControllerPk, electionContractInstance };
}

import {
  AccountUpdate,
  Field,
  MerkleTree,
  Mina,
  Poseidon,
  PrivateKey,
} from 'o1js';

import Aggregation from '../../aggregation-programs/AggregationMM.js';
import Election from '../../election-contracts/Election.js';
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

  const electionContractInstance = new Election.Contract(
    electionContractPubKey
  );

  Election.setContractConstants({
    electionStartSlot: startSlot,
    electionFinalizeSlot: endSlot,
    votersRoot: votersRoot.toBigInt(),
  });

  Election.BatchReducerInstance.setContractInstance(electionContractInstance);

  console.time('Compile Vote Program');
  await Vote.Program.compile();
  console.timeEnd('Compile Vote Program');

  console.time('Compile Aggregate Program');
  await Aggregation.Program.compile();
  console.timeEnd('Compile Aggregate Program');

  console.log('Compiling batch reducer');
  await Election.BatchReducerInstance.compile();
  console.log('Batch reducer compiled');

  console.log('Compiling election contract');
  await Election.Contract.compile();
  console.log('Election contract compiled');

  console.time('Compile Election Contract');
  await Election.Contract.compile();
  console.timeEnd('Compile Election Contract');

  const electionData = new Election.StorageLayerInfoEncoding({
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
      await electionContractInstance.initialize(
        electionData,
        storageLayerCommitment
      );
    }
  );

  deployTx.sign([publisherPrivateKey, electionContractPk]);

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

  return { electionContractPk, electionContractInstance };
}

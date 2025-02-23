import {
  Field,
  Mina,
  PrivateKey,
  Poseidon,
  AccountUpdate,
  MerkleTree,
} from 'o1js';
import dotenv from 'dotenv';
import { mockVotes } from '../../createMockVotes.js';
import { runAggregate } from '../../runAggregateMM.js';
import Election from '../../../election-contracts/Election.js';
// import Aggregation from '../../aggregation-programs/AggregationMM.js';
import Vote from '../../../vote/Vote.js';
import { votersList } from '../../mock.js';

dotenv.config();

let Local = await Mina.LocalBlockchain({ proofsEnabled: true });
Mina.setActiveInstance(Local);

const [feePayer, aggr_1, aggr_2, aggr_3, aggr_4] = Local.testAccounts;

const electionPrivateKey = PrivateKey.random();
const electionPubKey = electionPrivateKey.toPublicKey();

const electionContractInstance = new Election.Contract(electionPubKey);

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

const electionData = new Election.StorageLayerInfoEncoding({
  first: Field.from(0),
  last: Field.from(0),
});

await mockVotes(electionPrivateKey);

Election.setContractConstants({
  electionStartSlot: 0,
  electionFinalizeSlot: 200,
  votersRoot: votersRoot.toBigInt(),
});

Election.BatchReducerInstance.setContractInstance(electionContractInstance);

console.log('Compiling batch reducer');
await Election.BatchReducerInstance.compile();
console.log('Batch reducer compiled');

console.log('Compiling election contract');
await Election.Contract.compile();
console.log('Election contract compiled');

const deployTx = await Mina.transaction(
  {
    sender: feePayer,
    fee: 1e8,
  },
  async () => {
    AccountUpdate.fundNewAccount(feePayer);
    await electionContractInstance.deploy();
    await electionContractInstance.initialize(electionData, Field.from(0));
  }
);

deployTx.sign([feePayer.key, electionPrivateKey]);

await deployTx.prove();

await deployTx.send();

console.log('Election contract deployed');

const proof_1 = await runAggregate(electionPubKey, 1);
const proof_2 = await runAggregate(electionPubKey, 2);
const proof_3 = await runAggregate(electionPubKey, 3);
// const proof_4 = await runAggregate(electionPubKey, 4);

if (!proof_1 || !proof_2 || !proof_3) {
  console.log('No proof generated');
  process.exit(1);
}

console.log('Proofs generated');

const settle_1 = await Mina.transaction(
  {
    sender: aggr_1,
    fee: 1e10,
  },
  async () => {
    await electionContractInstance.settleVotes(proof_1, aggr_1);
  }
);

await (await settle_1.sign([aggr_1.key]).prove()).send();

console.log('Settled proof 1');

const settle_2 = await Mina.transaction(
  {
    sender: aggr_2,
    fee: 1e10,
  },
  async () => {
    await electionContractInstance.settleVotes(proof_2, aggr_2);
  }
);

await (await settle_2.sign([aggr_2.key]).prove()).send();

console.log('Settled proof 2');

const settle_3 = await Mina.transaction(
  {
    sender: aggr_3,
    fee: 1e10,
  },
  async () => {
    await electionContractInstance.settleVotes(proof_3, aggr_3);
  }
);

await (await settle_3.sign([aggr_3.key]).prove()).send();

console.log('Settled proof 3');

// const settle_4 = await Mina.transaction(
//   {
//     sender: aggr_4,
//     fee: 1e10,
//   },
//   async () => {
//     await electionContractInstance.settleVotes(proof_4, aggr_4);
//   }
// );

// await (await settle_4.sign([aggr_4.key]).prove()).send();

// console.log('Settled proof 4');

console.log('All proofs settled');

const batches = await Election.BatchReducerInstance.prepareBatches();

const reduce = await Mina.transaction(
  {
    sender: feePayer,
    fee: 1e8,
  },
  async () => {
    await electionContractInstance.reduce(batches[0].batch, batches[0].proof);
  }
);

await (await reduce.sign([feePayer.key]).prove()).send();

console.log('Reduced batch');

console.log('All done');

const electionState = electionContractInstance.electionState.get();

console.log('Election state:');
console.log('aggregateCount:', electionState.maximumCountedVotes.toString());
console.log(
  'lastAggregator:',
  electionState.lastAggregatorPubKeyHash.toString()
);
console.log(
  'voteOptions:',
  Vote.fieldToUInt32BigEndian(electionState.voteOptions.options[0]).map((x) =>
    x.toString()
  )
);
console.log(
  'aggr_3 hash:',
  Poseidon.hash(aggr_3.key.toPublicKey().toFields()).toString()
);

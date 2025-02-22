import { fetchAccount, fetchLastBlock, Field, Mina, PrivateKey } from 'o1js';
import { mockVotes } from '../createMockVotes.js';
import { runAggregate } from '../runAggregateMM.js';
import deploy from '../deployToMina.js';
import Election from '../../election-contracts/Election.js';
import { votersList } from '../mock.js';

export async function getGlobalSlot() {
  const latestBlock = await fetchLastBlock(
    'https://api.minascan.io/node/devnet/v1/graphql'
  );

  return Number(latestBlock.globalSlotSinceGenesis.toBigint());
}

const currentSlot = await getGlobalSlot();

const Network = Mina.Network({
  mina: 'https://api.minascan.io/node/devnet/v1/graphql',
  archive: 'https://api.minascan.io/archive/devnet/v1/graphql',
});
Mina.setActiveInstance(Network);

//prettier-ignore
const feePayerKey = PrivateKey.fromBase58('EKFbYSwuszwQL9RX7upm4iqfJpYooi7VMyWs1fwQiyYHYLwtr26R');
const feePayerPubKey = feePayerKey.toPublicKey();

const aggregators = Array.from({ length: 4 }, (_, i) => i + 1).map((i) => {
  let priv = votersList[i - 1][0];
  let pub = votersList[i - 1][1];
  return { priv, pub };
});

// Promise.all(
//   aggregators.map(async ({ priv, pub }, i) => {
//     console.log(`Sending fund request ${i + 1}`);
//     await Mina.faucet(pub, 'devnet');
//     // wait 1000ms to avoid rate limiting
//     await new Promise((resolve) => setTimeout(resolve, 2000));
//     console.log(`Aggregator ${pub.toBase58()} fund request sent`);
//   })
// );

const { electionContractPk: electionPrivKey, electionContractInstance } =
  await deploy(
    currentSlot,
    currentSlot + 10,
    [Field.from(0), Field.from(0)],
    Field.from(0),
    feePayerKey
  );

console.log(
  `Election Contract Deployed Private Key: ${electionPrivKey.toBase58()}`
);

await mockVotes(electionPrivKey);

const proof_1 = await runAggregate(electionPrivKey.toPublicKey(), 1, false);
const proof_2 = await runAggregate(electionPrivKey.toPublicKey(), 2, false);
const proof_3 = await runAggregate(electionPrivKey.toPublicKey(), 3, false);
const proof_4 = await runAggregate(electionPrivKey.toPublicKey(), 4, false);

if (!proof_1 || !proof_2 || !proof_3 || !proof_4) {
  console.error('Error running aggregate');
  process.exit(1);
}

const proofs = [proof_1, proof_2, proof_3, proof_4];

let transactions: any = [];
for (let i = 0; i < 4; i++) {
  const transaction = await Mina.transaction(
    {
      sender: aggregators[i].pub,
      fee: 1e10,
    },
    async () => {
      await electionContractInstance.settleVotes(proofs[i], aggregators[i].pub);
    }
  );

  await transaction.sign([aggregators[i].priv]).prove();
  transactions.push(transaction.send());
}

const pendingTransactions = await Promise.all(transactions);

pendingTransactions.forEach((pendingTransaction, i) => {
  if (pendingTransaction.status === 'rejected') {
    console.log(`Error sending transaction ${i} (see above)`);
    process.exit(1);
  }

  console.log(
    `See transaction at https://minascan.io/devnet/tx/${pendingTransaction.hash}`
  );
});

for (let i = 0; i < 4; i++) {
  await pendingTransactions[i].wait();
  console.log(`Transaction ${i} settled`);
}

console.log('Votes settled');

await fetchAccount({
  publicKey: electionPrivKey.toPublicKey(),
});

await Mina.fetchActions(electionPrivKey.toPublicKey());

const batches = await Election.BatchReducerInstance.prepareBatches();

const reduce = await Mina.transaction(
  {
    sender: feePayerPubKey,
    fee: 1e10,
  },
  async () => {
    await electionContractInstance.reduce(batches[0].batch, batches[0].proof);
  }
);

const pendingTransaction = await (
  await reduce.sign([feePayerKey]).prove()
).send();

if (pendingTransaction.status === 'rejected') {
  console.log('Error sending transaction (see above)');
  process.exit(1);
}

console.log(
  `See transaction at https://minascan.io/devnet/tx/${pendingTransaction.hash}`
);

for (let i = 0; i < 4; i++) {
  await pendingTransaction.wait();
}

console.log('Reduced batch');

fetchAccount({
  publicKey: electionPrivKey.toPublicKey(),
});

const maxCounted = (await electionContractInstance.electionState.fetch())
  ?.maximumCountedVotes;

const voteOptions = (await electionContractInstance.electionState.fetch())
  ?.voteOptions;

const lastAggregator = await electionContractInstance.electionState.fetch();

console.log('Maximum counted votes: ', maxCounted?.toString());

if (!voteOptions) {
  console.log('No vote options found');
  process.exit(1);
}

const result = voteOptions.toResults();

for (let i = 0; i < result.length; i++) {
  console.log(`Vote option ${i + 1}: ${result[i]}`);
}

console.log(
  'Last aggregator: ',
  lastAggregator?.lastAggregatorPubKeyHash.toString()
);

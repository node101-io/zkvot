import { fetchAccount, fetchLastBlock, Field, Mina, PrivateKey } from 'o1js';

import { votersList } from './mock.js';
import { mockVotes } from '../example/createMockVotes.js';
import { runAggregate } from '../example/runAggregate.js';

import deploy from '../example/deployToMina.js';
import Aggregation from '../Aggregation.js';

export async function getBlockHeight() {
  const latestBlock = await fetchLastBlock(
    'https://api.minascan.io/node/devnet/v1/graphql'
  );

  return Number(latestBlock.blockchainLength.toBigint());
}

const currentBlock = await getBlockHeight();

const feePayerKey = PrivateKey.fromBase58(
  'EKFbYSwuszwQL9RX7upm4iqfJpYooi7VMyWs1fwQiyYHYLwtr26R'
);

const feePayerPubKey = feePayerKey.toPublicKey();

const { electionContractPk: electionPrivKey, electionContractInstance } =
  await deploy(
    currentBlock,
    currentBlock + 10,
    votersList,
    [Field.from(0), Field.from(0)],
    feePayerKey
  );
console.log(`Election Private Key: ${electionPrivKey.toBase58()}`);

await mockVotes(electionPrivKey);
const proof = await runAggregate(electionPrivKey.toPublicKey());

if (!proof) {
  console.log('No proof generated');
  process.exit(1);
}

const settlePrrof = await Mina.transaction(
  {
    sender: feePayerPubKey,
    fee: 1e8,
  },
  async () => {
    await electionContractInstance.settleVotes(
      proof,
      electionPrivKey.toPublicKey()
    );
  }
);

settlePrrof.sign([feePayerKey]);
await settlePrrof.prove();
let pendingTransaction = await settlePrrof.send();

if (pendingTransaction.status === 'rejected') {
  console.log('error sending transaction (see above)');
  process.exit(0);
}

console.log(
  `See transaction at https://minascan.io/devnet/tx/${pendingTransaction.hash}`
);

await pendingTransaction.wait();

console.log('Votes settled');

await fetchAccount({
  publicKey: electionPrivKey.toPublicKey(),
});

const maxCounted = await electionContractInstance.maximumCountedVotes.fetch();

const voteOptions = await electionContractInstance.voteOptions.fetch();

console.log('Maximum counted votes: ', maxCounted?.toString());

if (!voteOptions) {
  console.log('No vote options found');
  process.exit(1);
}

let arr = Aggregation.fieldToUInt32BigEndian(voteOptions.voteOptions_1);

for (let i = 0; i < 7; i++) {
  console.log(`voteOptions_${i + 1}:`, arr[i].toString());
}

arr = Aggregation.fieldToUInt32BigEndian(voteOptions.voteOptions_2);

for (let i = 0; i < 7; i++) {
  console.log(`voteOptions_${i + 8}:`, arr[i].toString());
}

arr = Aggregation.fieldToUInt32BigEndian(voteOptions.voteOptions_3);

for (let i = 0; i < 7; i++) {
  console.log(`voteOptions_${i + 15}:`, arr[i].toString());
}

arr = Aggregation.fieldToUInt32BigEndian(voteOptions.voteOptions_4);

for (let i = 0; i < 7; i++) {
  console.log(`voteOptions_${i + 22}:`, arr[i].toString());
}

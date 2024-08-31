import fs from 'fs/promises';
import {
  Field,
  Mina,
  MerkleTree,
  PrivateKey,
  PublicKey,
  Poseidon,
  verify,
} from 'o1js';

import { MerkleWitnessClass } from './utils.js';

import { Vote, VotePrivateInputs, VotePublicInputs } from './VoteProgram.js';
import { RangeAggregationProgram } from './RangeAggregationProgram.js';

let Local = await Mina.LocalBlockchain({ proofsEnabled: true });
Mina.setActiveInstance(Local);

let votersArray: Array<[privateKey: PrivateKey, publicKey: PublicKey]> = [];

for (let i = 0; i < 20; i++) {
  let privateKey = PrivateKey.random();
  let publicKey = privateKey.toPublicKey();
  votersArray.push([privateKey, publicKey]);
}

votersArray.sort((a) => {
  if (a[1] < a[1]) {
    return -1;
  }
  if (a[1] > a[1]) {
    return 1;
  }
  return 0;
});

let votersTree = new MerkleTree(32);

for (let i = 0; i < 20; i++) {
  let leaf = Poseidon.hash(votersArray[i][1].toFields());
  votersTree.setLeaf(BigInt(i), leaf);
}

let votersRoot = votersTree.getRoot();

await fs.writeFile('votersRoot.json', JSON.stringify(votersRoot, null, 2));

console.log(`Voters root: ${votersRoot.toString()}`);

console.log('compiling vote program');
let { verificationKey } = await Vote.compile();
console.log('verification key', verificationKey.data.slice(0, 10) + '..');

console.log('casting votes');
let voteProofs = [];

let votingId = Field.from(123);

for (let i = 0; i < 20; i++) {
  let vote = BigInt((i % 2) + 1);
  let privateKey = votersArray[i][0];
  let merkleTreeWitness = votersTree.getWitness(BigInt(i));
  let witness = new MerkleWitnessClass(merkleTreeWitness);

  let votePublicInputs = new VotePublicInputs({
    votingId: votingId,
    vote: Field.from(vote),
    votersRoot: votersRoot,
  });
  let votePrivateInputs = new VotePrivateInputs({
    privateKey: privateKey,
    votersMerkleWitness: witness,
  });

  let time = Date.now();
  let voteProof = await Vote.vote(votePublicInputs, votePrivateInputs);

  console.log(`vote ${i} proof took ${(Date.now() - time) / 1000} seconds `);
  voteProofs.push(voteProof);
}

voteProofs.sort((a, b) => {
  if (
    a.publicOutput.nullifier.toBigInt() < b.publicOutput.nullifier.toBigInt()
  ) {
    return -1;
  }
  if (
    a.publicOutput.nullifier.toBigInt() > b.publicOutput.nullifier.toBigInt()
  ) {
    return 1;
  }
  return 0;
});

await fs.writeFile('voteProofs.json', JSON.stringify(voteProofs, null, 2));

let { verificationKey: voteAggregatorVerificationKey } =
  await RangeAggregationProgram.compile();

await fs.writeFile(
  'voteAggregatorVerificationKey.json',
  JSON.stringify(
    {
      data: voteAggregatorVerificationKey.data,
      hash: voteAggregatorVerificationKey.hash.toString(),
    },
    null,
    2
  )
);

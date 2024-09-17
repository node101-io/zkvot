import fs from 'fs/promises';
import {
  Field,
  Mina,
  MerkleTree,
  PrivateKey,
  PublicKey,
  Poseidon,
  verify,
  Signature,
} from 'o1js';

import { MerkleWitnessClass } from './utils.js';

import { Vote, VotePrivateInputs, VotePublicInputs } from './VoteProgram.js';
import { RangeAggregationProgram } from './RangeAggregationProgram.js';

let Local = await Mina.LocalBlockchain({ proofsEnabled: true });
Mina.setActiveInstance(Local);

let votersArray: Array<[privateKey: PrivateKey, publicKey: PublicKey]> = [];

for (let i = 0; i < 40; i++) {
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

let votersTree = new MerkleTree(20);

for (let i = 0; i < 40; i++) {
  let leaf = Poseidon.hash(votersArray[i][1].toFields());
  votersTree.setLeaf(BigInt(i), leaf);
}

let votersRoot = votersTree.getRoot();
console.log(`Voters root: ${votersRoot.toString()}`);

await fs.writeFile('votersRoot.json', JSON.stringify(votersRoot, null, 2));

console.log('compiling vote program');
let { verificationKey } = await Vote.compile();
console.log('verification key', verificationKey.data.slice(0, 10) + '..');

console.log('casting votes');

let votingId = Field.from(123);

let voteProofs = [];
for (let i = 0; i < 20; i++) {
  let vote = BigInt(Math.floor(Math.random() * 14) + 1);
  let privateKey = votersArray[i][0];
  let merkleTreeWitness = votersTree.getWitness(BigInt(i));
  let witness = new MerkleWitnessClass(merkleTreeWitness);

  let votePublicInputs = new VotePublicInputs({
    votingId: votingId,
    vote: Field.from(vote),
    votersRoot: votersRoot,
  });
  const signedVoteId = Signature.create(privateKey, [votingId]);
  const signedVote = Signature.create(privateKey, [votingId, Field.from(vote)]);
  let votePrivateInputs = new VotePrivateInputs({
    voterKey: privateKey.toPublicKey(),
    signedVoteId: signedVoteId,
    signedVote: signedVote,
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

voteProofs = [];
for (let i = 20; i < 40; i++) {
  let vote = BigInt(Math.floor(Math.random() * 14) + 1);
  let privateKey = votersArray[i][0];
  let merkleTreeWitness = votersTree.getWitness(BigInt(i));
  let witness = new MerkleWitnessClass(merkleTreeWitness);

  let votePublicInputs = new VotePublicInputs({
    votingId: votingId,
    vote: Field.from(vote),
    votersRoot: votersRoot,
  });
  const signedVoteId = Signature.create(privateKey, [votingId]);
  const signedVote = Signature.create(privateKey, [votingId, Field.from(vote)]);
  let votePrivateInputs = new VotePrivateInputs({
    voterKey: privateKey.toPublicKey(),
    signedVoteId: signedVoteId,
    signedVote: signedVote,
    votersMerkleWitness: witness,
  });

  let time = Date.now();
  let voteProof = await Vote.vote(votePublicInputs, votePrivateInputs);

  console.log(`vote ${i} proof took ${(Date.now() - time) / 1000} seconds `);
  voteProofs.push(voteProof);
}

await fs.writeFile(
  'voteProofsRandom.json',
  JSON.stringify(voteProofs, null, 2)
);

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

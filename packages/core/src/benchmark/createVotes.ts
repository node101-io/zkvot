import fs from 'fs/promises';
import { performance } from 'perf_hooks';
import {
  Field,
  MerkleTree,
  PrivateKey,
  Poseidon,
  Nullifier,
  PublicKey,
} from 'o1js';

import Vote from '../Vote.js';
import MerkleTreeNamespace from '../MerkleTree.js';

export const createVotes = async (
  electionPrivateKey: PrivateKey,
  votersList: Array<[PrivateKey, PublicKey]>
) => {
  votersList.sort((a, b) => {
    if (
      Poseidon.hash(a[1].toFields()).toBigInt() <
      Poseidon.hash(b[1].toFields()).toBigInt()
    )
      return -1;

    if (
      Poseidon.hash(a[1].toFields()).toBigInt() >
      Poseidon.hash(b[1].toFields()).toBigInt()
    )
      return 1;

    return 0;
  });

  const votersTree = new MerkleTree(20);

  for (let i = 0; i < votersList.length; i++) {
    let leaf = Poseidon.hash(votersList[i][1].toFields());
    votersTree.setLeaf(BigInt(i), leaf);
  }

  const votersRoot = votersTree.getRoot();
  console.log(`Voters root: ${votersRoot.toString()}`);

  await fs.writeFile('votersRoot.json', JSON.stringify(votersRoot, null, 2));

  console.log('compiling vote program');
  await Vote.Program.compile();

  const electionPubKey = electionPrivateKey.toPublicKey();

  let voteProofs = [];
  let performanceResults = [];
  for (let i = 0; i < votersList.length; i++) {
    let vote = BigInt(Math.floor(Math.random() * 21) + 1);
    let privateKey = votersList[i][0];
    let voterKey = privateKey.toPublicKey();
    let merkleTreeWitness = votersTree.getWitness(BigInt(i));
    let votersMerkleWitness = new MerkleTreeNamespace.Witness(
      merkleTreeWitness
    );

    let votePublicInputs = new Vote.PublicInputs({
      electionPubKey: electionPubKey,
      vote: Field.from(vote),
      votersRoot: votersRoot,
    });
    const nullifier = Nullifier.fromJSON(
      Nullifier.createTestNullifier(
        [Poseidon.hash(electionPubKey.toFields())],
        privateKey
      )
    );

    let votePrivateInputs = new Vote.PrivateInputs({
      voterKey,
      nullifier,
      votersMerkleWitness,
    });

    let time = performance.now();
    let voteProof = await Vote.Program.vote(
      votePublicInputs,
      votePrivateInputs
    );
    let endTime = performance.now();
    console.log(`Time spent generating proof: ${endTime - time} ms`);
    performanceResults.push(endTime - time);
    voteProofs.push(voteProof.proof);
  }

  voteProofs.sort((a, b) => {
    if (
      a.publicOutput.nullifier.toBigInt() < b.publicOutput.nullifier.toBigInt()
    )
      return -1;

    if (
      a.publicOutput.nullifier.toBigInt() > b.publicOutput.nullifier.toBigInt()
    )
      return 1;

    return 0;
  });

  await fs.writeFile('voteProofs.json', JSON.stringify(voteProofs, null, 2));

  return performanceResults;
};

import fs from 'fs/promises';
import {
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  Poseidon,
  Signature,
} from 'o1js';
import dotenv from 'dotenv';

import { votersArray } from '../local/mock.js';

import Aggregation from '../Aggregation.js';
import MerkleTree from '../MerkleTree.js';
import Vote from '../Vote.js';

dotenv.config();

let Local = await Mina.LocalBlockchain({ proofsEnabled: true });
Mina.setActiveInstance(Local);

// let votersArray: Array<[privateKey: PrivateKey, publicKey: PublicKey]> = [];

// for (let i = 0; i < 40; i++) {
//   let privateKey = PrivateKey.random();
//   let publicKey = privateKey.toPublicKey();
//   votersArray.push([privateKey, publicKey]);
// }

export const mockVotes = async (electionPrivateKey: PrivateKey) => {
  votersArray.sort((a, b) => {
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

  let votersTree = MerkleTree.createFromStringArray(votersArray.map((v) => v[1]));

  if (!votersTree)
    throw new Error('Failed to create Merkle tree from voters array');

  let votersRoot = votersTree.getRoot();
  console.log(`Voters root: ${votersRoot.toString()}`);

  await fs.writeFile('votersRoot.json', JSON.stringify(votersRoot, null, 2));

  console.log('compiling vote program');
  let { verificationKey } = await Vote.Program.compile();
  console.log('verification key', verificationKey.data.slice(0, 10) + '..');

  console.log('casting votes');

  const electionId = electionPrivateKey.toPublicKey();
  console.log(`Election id: ${electionId.toBase58()}`);

  let voteProofs = [];
  for (let i = 0; i < 4; i++) {
    let vote = BigInt(Math.floor(Math.random() * 28) + 1);
    let privateKey = votersArray[i][0];
    let merkleTreeWitness = votersTree.getWitness(BigInt(i));
    let witness = new MerkleTree.Witness(merkleTreeWitness);

    let votePublicInputs = new Vote.PublicInputs({
      electionId: electionId,
      vote: Field.from(vote),
      votersRoot: votersRoot,
    });
    const signedElectionId = Signature.create(
      privateKey,
      electionId.toFields()
    );

    let votePrivateInputs = new Vote.PrivateInputs({
      voterKey: privateKey.toPublicKey(),
      signedElectionId: signedElectionId,
      votersMerkleWitness: witness,
    });

    let time = Date.now();
    let voteProof = await Vote.Program.vote(votePublicInputs, votePrivateInputs);

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

  // voteProofs = [];
  // for (let i = 20; i < 40; i++) {
  //   let vote = BigInt(Math.floor(Math.random() * 28) + 1);
  //   let privateKey = votersArray[i][0];
  //   let merkleTreeWitness = votersTree.getWitness(BigInt(i));
  //   let witness = new MerkleWitnessClass(merkleTreeWitness);

  //   let votePublicInputs = new VotePublicInputs({
  //     electionId: electionId,
  //     vote: Field.from(vote),
  //     votersRoot: votersRoot,
  //   });
  //   const signedElectionId = Signature.create(privateKey, electionId.toFields());

  //   let votePrivateInputs = new VotePrivateInputs({
  //     voterKey: privateKey.toPublicKey(),
  //     signedElectionId: signedElectionId,

  //     votersMerkleWitness: witness,
  //   });

  //   let time = Date.now();
  //   let voteProof = await Vote.vote(votePublicInputs, votePrivateInputs);

  //   console.log(`vote ${i} proof took ${(Date.now() - time) / 1000} seconds `);
  //   voteProofs.push(voteProof);
  // }

  // await fs.writeFile(
  //   'voteProofsRandom.json',
  //   JSON.stringify(voteProofs, null, 2)
  // );

  let { verificationKey: voteAggregatorVerificationKey } =
    await Aggregation.Program.compile();

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
};

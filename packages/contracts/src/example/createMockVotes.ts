import fs from 'fs/promises';
import { Field, Mina, MerkleTree, PrivateKey, Poseidon, Nullifier } from 'o1js';
import dotenv from 'dotenv';
import { votersArray as votersList } from '../local/mock.js';
import Vote from '../Vote.js';
import MerkleTreeNamespace from '../MerkleTree.js';
import Aggregation from '../Aggregation.js';
dotenv.config();

let Local = await Mina.LocalBlockchain({ proofsEnabled: true });
Mina.setActiveInstance(Local);

export const mockVotes = async (electionPrivateKey: PrivateKey) => {
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

  let votersRoot = votersTree.getRoot();
  console.log(`Voters root: ${votersRoot.toString()}`);

  await fs.writeFile('votersRoot.json', JSON.stringify(votersRoot, null, 2));

  console.log('compiling vote program');
  let { verificationKey } = await Vote.Program.compile();
  console.log('verification key', verificationKey.data.slice(0, 10) + '..');

  console.log('casting votes');

  const electionPubKey = electionPrivateKey.toPublicKey();
  console.log(`Election id: ${electionPubKey.toBase58()}`);

  let voteProofs = [];
  for (let i = 0; i < 4; i++) {
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
      Nullifier.createTestNullifier(electionPubKey.toFields(), privateKey)
    );

    let votePrivateInputs = new Vote.PrivateInputs({
      voterKey,
      nullifier,
      votersMerkleWitness,
    });

    let time = Date.now();
    let voteProof = await Vote.Program.vote(
      votePublicInputs,
      votePrivateInputs
    );

    console.log(`vote ${i} proof took ${(Date.now() - time) / 1000} seconds `);
    voteProofs.push(voteProof.proof);
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

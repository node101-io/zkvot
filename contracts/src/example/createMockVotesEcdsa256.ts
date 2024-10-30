import fs from 'fs/promises';
import {
  Field,
  Crypto,
  Mina,
  MerkleTree,
  PrivateKey,
  Poseidon,
  createForeignCurveV2,
  Provable,
  createEcdsaV2,
} from 'o1js';

import { MerkleWitnessClass } from '../utils.js';

import {
  Vote,
  VotePublicInputs,
  VoteWithSecp256k1PrivateInputs,
} from '../VoteProgram.js';
import { RangeAggregationProgram } from '../RangeAggregationProgram.js';
import { Wallet } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();
class Secp256k1 extends createForeignCurveV2(Crypto.CurveParams.Secp256k1) {}

class EthSignature {
  public ecdsaSignature = createEcdsaV2(Secp256k1);

  fromHex(hex: string) {
    return this.ecdsaSignature.fromHex(hex);
  }
}

const ecdsaSignature = new EthSignature();

function bigintToUint8Array32BigEndian(input: bigint): Uint8Array {
  const bytes = new Uint8Array(32);
  let temp = input;

  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(temp & 0xffn);
    temp >>= 8n;
  }

  return bytes;
}

let Local = await Mina.LocalBlockchain({ proofsEnabled: true });
Mina.setActiveInstance(Local);

let votersArray: Array<
  [privateKey: string, publicKey: string, address: string, pubkey: Secp256k1]
> = [];

for (let i = 0; i < 40; i++) {
  let wallet = Wallet.createRandom();
  let privateKey = wallet.privateKey;
  let publicKey = wallet.publicKey;
  let address = wallet.address;
  let pubkey = Provable.witness(Secp256k1, () => Secp256k1.fromHex(publicKey));
  votersArray.push([privateKey, publicKey, address, pubkey]);
}

votersArray.sort((a, b) => {
  if (BigInt(a[2]) < BigInt(b[2])) {
    return -1;
  }
  if (BigInt(a[2]) > BigInt(b[2])) {
    return 1;
  }
  return 0;
});

console.log(
  votersArray.map((voter) => {
    return voter[2];
  })
);

let votersTree = new MerkleTree(20);

for (let i = 0; i < 40; i++) {
  let leaf = Field.from(BigInt(votersArray[i][2]));
  votersTree.setLeaf(BigInt(i), leaf);
}

let votersRoot = votersTree.getRoot();
console.log(`Voters root: ${votersRoot.toString()}`);

await fs.writeFile(
  'votersRootEcdsa256.json',
  JSON.stringify(votersRoot, null, 2)
);

console.log(await Vote.analyzeMethods());

console.time('compiling vote program');
let { verificationKey } = await Vote.compile();
console.timeEnd('compiling vote program');
console.log('verification key', verificationKey.data.slice(0, 10) + '..');

console.log('casting votes');

const electionPrivateKey = PrivateKey.fromBase58(
  // @ts-ignore
  process.env.ELECTION_PRIVATE_KEY
);
const electionId = electionPrivateKey.toPublicKey();

let voteProofs = [];
for (let i = 0; i < 20; i++) {
  let vote = BigInt(Math.floor(Math.random() * 28) + 1);
  let privateKey = votersArray[i][0];
  let address = votersArray[i][2];
  let pubkey = votersArray[i][3];
  let merkleTreeWitness = votersTree.getWitness(BigInt(i));
  let witness = new MerkleWitnessClass(merkleTreeWitness);

  console.log(`voter ${i} voting for ${vote}`);
  console.log(`voter ${i} address: ${address}`);
  console.log(`voter ${i} address in bigint: ${BigInt(address)}`);

  let votePublicInputs = new VotePublicInputs({
    electionId: electionId,
    vote: Field.from(vote),
    votersRoot: votersRoot,
  });
  const electionId_first_field = electionId.toFields()[0].toBigInt();
  const electionId_second_field = electionId.toFields()[1].toBigInt();

  const VoteIdArray: any = [
    ...bigintToUint8Array32BigEndian(electionId_first_field),
    ...bigintToUint8Array32BigEndian(electionId_second_field),
  ];

  const signer = new Wallet(privateKey);
  const signedElectionId = await signer.signMessage(VoteIdArray);

  const signedElectionIdEcdsa = ecdsaSignature.fromHex(signedElectionId);

  let votePrivateInputs = new VoteWithSecp256k1PrivateInputs({
    voterAddress: Field.from(BigInt(address)),
    voterPubKey: pubkey,
    signedElectionId: signedElectionIdEcdsa,
    votersMerkleWitness: witness,
  });

  console.log(`voter ${i} address: ${Field.from(BigInt(address)).toString()}`);

  console.time(`vote ${i} proof`);
  let voteProof = await Vote.voteWithSecp256k1(
    votePublicInputs,
    votePrivateInputs
  );
  console.timeEnd(`vote ${i} proof`);

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

await fs.writeFile(
  'voteProofsEcdsa256.json',
  JSON.stringify(voteProofs, null, 2)
);

voteProofs = [];
for (let i = 20; i < 40; i++) {
  let vote = BigInt(Math.floor(Math.random() * 28) + 1);
  let privateKey = votersArray[i][0];
  let address = votersArray[i][2];
  let pubkey = votersArray[i][3];
  let merkleTreeWitness = votersTree.getWitness(BigInt(i));
  let witness = new MerkleWitnessClass(merkleTreeWitness);

  let votePublicInputs = new VotePublicInputs({
    electionId: electionId,
    vote: Field.from(vote),
    votersRoot: votersRoot,
  });
  const electionId_first_field = electionId.toFields()[0].toBigInt();
  const electionId_second_field = electionId.toFields()[1].toBigInt();

  const VoteIdArray: any = [
    ...bigintToUint8Array32BigEndian(electionId_first_field),
    ...bigintToUint8Array32BigEndian(electionId_second_field),
  ];

  const signer = new Wallet(privateKey);
  const signedElectionId = await signer.signMessage(VoteIdArray);

  const signedElectionIdEcdsa = ecdsaSignature.fromHex(signedElectionId);

  let votePrivateInputs = new VoteWithSecp256k1PrivateInputs({
    voterAddress: Field.from(BigInt(address)),
    voterPubKey: pubkey,
    signedElectionId: signedElectionIdEcdsa,
    votersMerkleWitness: witness,
  });

  console.time(`vote ${i} proof`);
  let voteProof = await Vote.voteWithSecp256k1(
    votePublicInputs,
    votePrivateInputs
  );

  console.timeEnd(`vote ${i} proof`);
  voteProofs.push(voteProof);
}

await fs.writeFile(
  'voteProofsRandomEcdsa256.json',
  JSON.stringify(voteProofs, null, 2)
);

let { verificationKey: voteAggregatorVerificationKey } =
  await RangeAggregationProgram.compile();

await fs.writeFile(
  'voteAggregatorVerificationKeyEcdsa256.json',
  JSON.stringify(
    {
      data: voteAggregatorVerificationKey.data,
      hash: voteAggregatorVerificationKey.hash.toString(),
    },
    null,
    2
  )
);

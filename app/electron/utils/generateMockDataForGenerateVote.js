import {
  Field,
  Mina,
  MerkleTree,
  PrivateKey,
  PublicKey,
  Poseidon,
  Signature,
} from 'o1js';

let privateKey = PrivateKey.random();
let publicKey = privateKey.toPublicKey().toJSON();

let vote = 1;

const electionPrivateKey = PrivateKey.random()
const electionId = electionPrivateKey.toPublicKey();
const signedElectionId = Signature.create(privateKey, electionId.toFields()).toJSON();

let votersArray = [
  PrivateKey.random().toPublicKey().toJSON(),
  PrivateKey.random().toPublicKey().toJSON(),
  publicKey,
];

console.log({electionId: electionId.toJSON() ,signedElectionId, vote, votersArray, publicKey });



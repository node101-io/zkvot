import { MerkleTree, Poseidon, PublicKey } from 'o1js';

const MERKLE_DEPTH = 20;

export default (votersList: string[]): bigint => {
  const merkleTree = new MerkleTree(MERKLE_DEPTH);

  votersList.sort((left, right) => {
    if (left < right) return 1;
    if (left > right) return -1;
    return 0;
  });

  votersList.forEach((voter, i) => {
    merkleTree.setLeaf(BigInt(i), Poseidon.hash(PublicKey.fromJSON(voter).toFields()));
  });

  return merkleTree.getRoot().toBigInt();
};

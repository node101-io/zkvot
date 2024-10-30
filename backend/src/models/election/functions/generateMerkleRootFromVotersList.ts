import { MerkleTree, Poseidon, PublicKey } from 'o1js';

const MERKLE_DEPTH = 20;

export default (votersList: {
  public_key: string;
}[]): bigint => {
  const merkleTree = new MerkleTree(MERKLE_DEPTH);

  votersList.sort((left, right) => {
    if (left.public_key < right.public_key) return 1;
    if (left.public_key > right.public_key) return -1;
    return 0;
  });

  votersList.forEach((voter, i) => {
    merkleTree.setLeaf(BigInt(i), Poseidon.hash(PublicKey.fromJSON(voter.public_key).toFields()));
  });

  return merkleTree.getRoot().toBigInt();
};